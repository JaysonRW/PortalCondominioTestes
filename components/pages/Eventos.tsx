
import React, { useState } from 'react';
import type { Evento } from '../../types';
import { CalendarIcon } from '../Icons';

const mockEventos: Evento[] = [
    { id: 1, title: 'Festa Junina', date: new Date(2024, 7, 10), description: 'Arraiá com comidas típicas e música ao vivo no salão de festas.', location: 'Salão de Festas' },
    { id: 2, title: 'Cinema ao Ar Livre', date: new Date(2024, 7, 17), description: 'Exibição de filme clássico no jardim principal. Traga sua cadeira!', location: 'Jardim Principal' },
    { id: 3, title: 'Torneio de Tênis', date: new Date(2024, 8, 1), description: 'Inscrições abertas para o torneio de duplas. Vagas limitadas.', location: 'Quadra de Tênis' },
    { id: 4, title: 'Dia das Crianças', date: new Date(2024, 9, 12), description: 'Brinquedos, guloseimas e atividades para a criançada.', location: 'Playground' },
];

const Eventos: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date(2024, 7, 1)); // August 2024 for demo

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const monthName = currentDate.toLocaleString('pt-BR', { month: 'long' });
    const year = currentDate.getFullYear();

    const calendarDays = Array.from({ length: firstDayOfMonth }, (_, i) => <div key={`empty-${i}`} className="border-r border-b border-white/10"></div>);
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const hasEvent = mockEventos.some(e => e.date.toDateString() === date.toDateString());
        calendarDays.push(
            <div key={day} className={`p-2 border-r border-b border-white/10 h-24 flex flex-col ${hasEvent ? 'bg-accent/10' : ''}`}>
                <span className={`font-bold ${new Date().toDateString() === date.toDateString() ? 'text-accent' : 'text-white/80'}`}>{day}</span>
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
                        <h3 className="text-xl font-bold capitalize text-accent">{monthName} {year}</h3>
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
                        {mockEventos.sort((a,b) => a.date.getTime() - b.date.getTime()).map(evento => (
                            <div key={evento.id} className="bg-white/5 p-4 rounded-lg border border-transparent hover:border-accent/50 transition-colors duration-300">
                                <div className="flex items-center">
                                    <div className="flex flex-col items-center justify-center bg-accent text-primary p-2 rounded-md w-16 h-16 mr-4">
                                        <span className="text-2xl font-bold leading-none">{evento.date.getDate()}</span>
                                        <span className="text-xs font-semibold uppercase">{evento.date.toLocaleString('pt-BR', { month: 'short' })}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">{evento.title}</h4>
                                        <p className="text-sm text-white/70">{evento.location}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-white/80 mt-3 pt-3 border-t border-white/10">{evento.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Eventos;
