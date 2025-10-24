
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Comunicado } from '../../types';
import { PlusIcon, PencilIcon, TrashIcon, CloseIcon } from '../Icons';

const AdminComunicados: React.FC = () => {
    const { user } = useAuth();
    const [comunicados, setComunicados] = useState<Comunicado[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingComunicado, setEditingComunicado] = useState<Comunicado | null>(null);
    const [formState, setFormState] = useState({ title: '', summary: '' });

    const fetchComunicados = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('comunicados')
            .select('*, profiles(full_name)');

        if (error) {
            console.error(error);
            setError('Falha ao carregar comunicados.');
        } else if (data) {
            const sortedData = (data as Comunicado[]).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setComunicados(sortedData);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchComunicados();
    }, [fetchComunicados]);

    const handleOpenModal = (comunicado: Comunicado | null = null) => {
        setEditingComunicado(comunicado);
        setFormState(comunicado ? { title: comunicado.title, summary: comunicado.summary } : { title: '', summary: '' });
        setError(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingComunicado(null);
        setFormState({ title: '', summary: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const comunicadoData = {
            title: formState.title,
            summary: formState.summary,
            author_id: user.id,
        };

        let response;
        if (editingComunicado) {
            response = await supabase.from('comunicados').update(comunicadoData).eq('id', editingComunicado.id);
        } else {
            response = await supabase.from('comunicados').insert(comunicadoData);
        }

        if (response.error) {
            setError(response.error.message);
        } else {
            handleCloseModal();
            await fetchComunicados();
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este comunicado?')) {
            const { error } = await supabase.from('comunicados').delete().eq('id', id);
            if (error) {
                setError(error.message);
            } else {
                await fetchComunicados();
            }
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-accent">Gerenciar Comunicados</h3>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center bg-accent text-primary px-4 py-2 rounded-md font-semibold hover:bg-accent/80 transition-colors"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Adicionar
                </button>
            </div>

            {loading && <p>Carregando...</p>}
            {error && !isModalOpen && <p className="text-red-400 bg-red-500/10 p-3 rounded-md">{error}</p>}
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/20 text-white/70">
                            <th className="p-3">Título</th>
                            <th className="p-3 hidden md:table-cell">Autor</th>
                            <th className="p-3 hidden sm:table-cell">Data</th>
                            <th className="p-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comunicados.map(comunicado => (
                            <tr key={comunicado.id} className="border-b border-white/10 hover:bg-white/5">
                                <td className="p-3 font-semibold">{comunicado.title}</td>
                                <td className="p-3 hidden md:table-cell">{comunicado.profiles?.full_name || 'N/A'}</td>
                                <td className="p-3 hidden sm:table-cell text-sm text-white/70">{new Date(comunicado.created_at).toLocaleDateString('pt-BR')}</td>
                                <td className="p-3 text-right">
                                    <button onClick={() => handleOpenModal(comunicado)} className="p-2 text-white/70 hover:text-accent"><PencilIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handleDelete(comunicado.id)} className="p-2 text-white/70 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-primary border border-white/20 rounded-lg p-6 w-full max-w-lg relative">
                        <button onClick={handleCloseModal} className="absolute top-4 right-4 text-white/70 hover:text-white">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                        <h3 className="text-2xl font-bold text-accent mb-4">
                            {editingComunicado ? 'Editar Comunicado' : 'Novo Comunicado'}
                        </h3>
                        {error && <p className="text-red-400 bg-red-500/10 p-3 rounded-md mb-4">{error}</p>}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-white/80">Título</label>
                                <input
                                    id="title"
                                    type="text"
                                    value={formState.title}
                                    onChange={e => setFormState({...formState, title: e.target.value})}
                                    className="mt-1 w-full bg-white/10 border border-white/20 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="summary" className="block text-sm font-medium text-white/80">Resumo</label>
                                <textarea
                                    id="summary"
                                    rows={5}
                                    value={formState.summary}
                                    onChange={e => setFormState({...formState, summary: e.target.value})}
                                    className="mt-1 w-full bg-white/10 border border-white/20 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                                    required
                                />
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

export default AdminComunicados;
