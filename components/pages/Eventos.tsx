import React, { useState, useEffect, useMemo } from 'react';
import type { Evento } from '../../types';
import { CalendarIcon } from '../Icons';
import { supabase } from '../../lib/supabase';


const Eventos: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date()); 
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEventos = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('eventos')
                .select('*');
            
            if (error) {
                console.error("Error fetching eventos", error);
            } else if (data) {
                const sortedData = (data as Evento[]).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                setEventos(sortedData);
            }
            setLoading(false);
        };
        fetchEventos();
    }, []);

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', timeZone: 'UTC' });
    const year = currentDate.getFullYear();

    const eventosNoMes = useMemo(() => 
        eventos.filter(e => {
            const eventDate = new Date(e.date);
            return eventDate.getUTCMonth() === currentDate.getUTCMonth() && eventDate.getUTCFullYear() === currentDate.getUTCFullYear();
        }), 
    [eventos, currentDate]);
    
    const proximosEventos = useMemo(() =>
        eventos.filter(e => new Date(e.date) >= new Date(new Date().toDateString())).slice(0, 5),
    [eventos]);

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const calendarDays = Array.from({ length: firstDayOfMonth }, (_, i) => <div key={`empty-${i}`} className="border-r border-b border-white/10"></div>);
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), day));
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const isToday = date.getTime() === today.getTime();
        const hasEvent = eventosNoMes.some(e => new Date(e.date).getUTCDate() === day);

        calendarDays.push(
            <div key={day} className={`p-2 border-r border-b border-white/10 h-24 flex flex-col ${hasEvent ? 'bg-accent/10' : ''}`}>
                <span className={`font-bold ${isToday ? 'text-accent' : 'text-white/80'}`}>{day}</span>
                {hasEvent && <div className="mt-auto self-center w-2 h-2 bg-accent rounded-full mb-1"></div>}
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white">Agenda de Eventos</h2>
                <p className="mt-2 text-white/70">Participe e conecte-se com seus vizinhos.</p>
            </div>

            <div className="lg:flex lg:space-x-8">
                {/* Calendar */}
                <div className="lg:w-2/3 bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                    <div className="flex justify-between items-center p-4 bg-white/10">
                        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-white/10">&lt;</button>
                        <h3 className="text-xl font-bold capitalize text-accent">{monthName} {year}</h3>
                        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-white/10">&gt;</button>
                    </div>
                    <div className="grid grid-cols-7 text-center font-semibold text-white/60 text-sm border-b border-white/10">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => <div key={day} className="p-2 border-r border-white/10 last:border-r-0">{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7">
                        {calendarDays}
                    </div>
                </div>

                {/* Event List */}
                <div className="lg:w-1/3 mt-8 lg:mt-0">
                    <h3 className="text-2xl font-bold text-white mb-4">Próximos Eventos</h3>
                    <div className="space-y-4">
                        {loading ? <p className="text-white/70">Carregando eventos...</p> : 
                         proximosEventos.length > 0 ? proximosEventos.map(evento => {
                            const eventDate = new Date(evento.date);
                            return (
                                <div key={evento.id} className="bg-white/5 p-4 rounded-lg border border-transparent hover:border-accent/50 transition-colors duration-300">
                                    <div className="flex items-center">
                                        <div className="flex flex-col items-center justify-center bg-accent text-primary p-2 rounded-md w-16 h-16 mr-4">
                                            <span className="text-2xl font-bold leading-none">{eventDate.getUTCDate()}</span>
                                            <span className="text-xs font-semibold uppercase">{eventDate.toLocaleString('pt-BR', { month: 'short', timeZone: 'UTC' })}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">{evento.title}</h4>
                                            <p className="text-sm text-white/70">{evento.location}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-white/80 mt-3 pt-3 border-t border-white/10">{evento.description}</p>
                                </div>
                            )
                        }) : <p className="text-white/70 bg-white/5 p-4 rounded-lg">Nenhum evento agendado.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Eventos;