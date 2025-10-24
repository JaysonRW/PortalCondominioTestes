import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Evento } from '../../types';
import { PlusIcon, PencilIcon, TrashIcon, CloseIcon } from '../Icons';

const AdminEventos: React.FC = () => {
    const { user } = useAuth();
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
    const [formState, setFormState] = useState({ title: '', event_date: '', location: '', description: '' });

    const fetchEventos = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('eventos')
            .select('*');

        if (error) {
            console.error("Error fetching eventos:", error);
            setError('Falha ao carregar eventos.');
        } else if (data) {
            const sortedData = (data as Evento[]).sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
            setEventos(sortedData);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchEventos();
    }, [fetchEventos]);

    const handleOpenModal = (evento: Evento | null = null) => {
        setEditingEvento(evento);
        const eventDate = evento ? new Date(evento.event_date).toISOString().split('T')[0] : '';
        setFormState(evento ? { ...evento, event_date: eventDate } : { title: '', event_date: '', location: '', description: '' });
        setError(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingEvento(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            setError("Você precisa estar logado para realizar esta ação.");
            return;
        }

        const eventoData = {
            title: formState.title,
            event_date: formState.event_date,
            location: formState.location,
            description: formState.description,
        };

        let response;
        if (editingEvento) {
            response = await supabase.from('eventos').update(eventoData).eq('id', editingEvento.id);
        } else {
            response = await supabase.from('eventos').insert({ ...eventoData, created_by: user.id });
        }

        if (response.error) {
            setError(response.error.message);
        } else {
            handleCloseModal();
            await fetchEventos();
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este evento?')) {
            await supabase.from('eventos').delete().eq('id', id);
            await fetchEventos();
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-accent">Gerenciar Eventos</h3>
                <button onClick={() => handleOpenModal()} className="flex items-center bg-accent text-primary px-4 py-2 rounded-md font-semibold hover:bg-accent/80 transition-colors">
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
                            <th className="p-3 hidden md:table-cell">Data</th>
                            <th className="p-3 hidden sm:table-cell">Local</th>
                            <th className="p-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {eventos.map(evento => (
                            <tr key={evento.id} className="border-b border-white/10 hover:bg-white/5">
                                <td className="p-3 font-semibold">{evento.title}</td>
                                <td className="p-3 hidden md:table-cell text-sm text-white/70">{new Date(evento.event_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                                <td className="p-3 hidden sm:table-cell">{evento.location}</td>
                                <td className="p-3 text-right">
                                    <button onClick={() => handleOpenModal(evento)} className="p-2 text-white/70 hover:text-accent"><PencilIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handleDelete(evento.id)} className="p-2 text-white/70 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-primary border border-white/20 rounded-lg p-6 w-full max-w-lg relative">
                        <button onClick={handleCloseModal} className="absolute top-4 right-4 text-white/70 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                        <h3 className="text-2xl font-bold text-accent mb-4">{editingEvento ? 'Editar Evento' : 'Novo Evento'}</h3>
                        {error && <p className="text-red-400 bg-red-500/10 p-3 rounded-md mb-4">{error}</p>}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-white/80">Título</label>
                                    <input id="title" type="text" value={formState.title} onChange={e => setFormState({...formState, title: e.target.value})} className="mt-1 w-full bg-white/10 border border-white/20 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent" required />
                                </div>
                                <div>
                                    <label htmlFor="event_date" className="block text-sm font-medium text-white/80">Data</label>
                                    <input id="event_date" type="date" value={formState.event_date} onChange={e => setFormState({...formState, event_date: e.target.value})} className="mt-1 w-full bg-white/10 border border-white/20 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent" required />
                                </div>
                            </div>
                             <div>
                                <label htmlFor="location" className="block text-sm font-medium text-white/80">Local</label>
                                <input id="location" type="text" value={formState.location} onChange={e => setFormState({...formState, location: e.target.value})} className="mt-1 w-full bg-white/10 border border-white/20 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent" required />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-white/80">Descrição</label>
                                <textarea id="description" rows={4} value={formState.description} onChange={e => setFormState({...formState, description: e.target.value})} className="mt-1 w-full bg-white/10 border border-white/20 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent" required />
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

export default AdminEventos;