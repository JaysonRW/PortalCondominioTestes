
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import type { FaqItem } from '../../types';
import { PlusIcon, PencilIcon, TrashIcon, CloseIcon } from '../Icons';

const AdminFaq: React.FC = () => {
    const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
    const [formState, setFormState] = useState({ question: '', answer: '' });

    const fetchFaq = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('faq_items')
            .select('*');

        if (error) {
            setError('Falha ao carregar FAQ.');
        } else if (data) {
            const sortedData = (data as FaqItem[]).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setFaqItems(sortedData);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchFaq();
    }, [fetchFaq]);

    const handleOpenModal = (faq: FaqItem | null = null) => {
        setEditingFaq(faq);
        setFormState(faq ? { question: faq.question, answer: faq.answer } : { question: '', answer: '' });
        setError(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingFaq(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let response;
        if (editingFaq) {
            response = await supabase.from('faq_items').update(formState).eq('id', editingFaq.id);
        } else {
            response = await supabase.from('faq_items').insert(formState);
        }

        if (response.error) {
            setError(response.error.message);
        } else {
            handleCloseModal();
            await fetchFaq();
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir esta pergunta?')) {
            await supabase.from('faq_items').delete().eq('id', id);
            await fetchFaq();
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-accent">Gerenciar FAQ</h3>
                <button onClick={() => handleOpenModal()} className="flex items-center bg-accent text-primary px-4 py-2 rounded-md font-semibold hover:bg-accent/80 transition-colors">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Adicionar
                </button>
            </div>

            {loading && <p>Carregando...</p>}
            {error && !isModalOpen && <p className="text-red-400 bg-red-500/10 p-3 rounded-md">{error}</p>}
            
            <div className="space-y-2">
                {faqItems.map(item => (
                    <div key={item.id} className="bg-white/5 rounded-md p-3 flex justify-between items-start">
                        <div>
                            <p className="font-semibold">{item.question}</p>
                            <p className="text-sm text-white/70 mt-1">{item.answer}</p>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                            <button onClick={() => handleOpenModal(item)} className="p-2 text-white/70 hover:text-accent"><PencilIcon className="w-5 h-5"/></button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 text-white/70 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-primary border border-white/20 rounded-lg p-6 w-full max-w-lg relative">
                        <button onClick={handleCloseModal} className="absolute top-4 right-4 text-white/70 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                        <h3 className="text-2xl font-bold text-accent mb-4">{editingFaq ? 'Editar Pergunta' : 'Nova Pergunta'}</h3>
                        {error && <p className="text-red-400 bg-red-500/10 p-3 rounded-md mb-4">{error}</p>}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="question" className="block text-sm font-medium text-white/80">Pergunta</label>
                                <input id="question" type="text" value={formState.question} onChange={e => setFormState({...formState, question: e.target.value})} className="mt-1 w-full bg-white/10 border border-white/20 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent" required />
                            </div>
                            <div>
                                <label htmlFor="answer" className="block text-sm font-medium text-white/80">Resposta</label>
                                <textarea id="answer" rows={5} value={formState.answer} onChange={e => setFormState({...formState, answer: e.target.value})} className="mt-1 w-full bg-white/10 border border-white/20 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent" required />
                            </div>
                            <div className="flex justify-end space-x-4 pt-4">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded-md text-white/80 hover:bg-white/10">Cancelar</button>
                                <button type="submit" className="px-6 py-2 bg-accent text-primary font-bold rounded-md hover:bg-accent/80">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminFaq;
