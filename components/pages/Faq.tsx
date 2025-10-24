
import React, { useState } from 'react';
import type { FaqItem } from '../../types';
import { ChevronDownIcon } from '../Icons';

const mockFaq: FaqItem[] = [
  { id: 1, question: 'Como reservar o salão de festas?', answer: 'A reserva do salão de festas deve ser feita através do aplicativo do condomínio ou diretamente na administração com pelo menos 15 dias de antecedência. É necessário verificar a disponibilidade e pagar a taxa de utilização.' },
  { id: 2, question: 'Quais são os horários de funcionamento da piscina?', answer: 'A piscina funciona de terça a domingo, das 9h às 21h. Às segundas-feiras, ela fica fechada para manutenção. Em feriados, o horário pode ser estendido, consulte os comunicados.' },
  { id: 3, question: 'Posso ter animais de estimação?', answer: 'Sim, animais de estimação de pequeno e médio porte são permitidos, desde que sigam as regras do regulamento interno, como o uso de coleira nas áreas comuns e a coleta de dejetos.' },
  { id: 4, question: 'Como funciona a coleta de lixo?', answer: 'A coleta de lixo orgânico ocorre diariamente às 19h. A coleta seletiva (recicláveis) ocorre às terças e quintas, no mesmo horário. Por favor, utilize os contentores corretos.' },
  { id: 5, question: 'O que fazer em caso de barulho excessivo de um vizinho?', answer: 'O horário de silêncio é das 22h às 8h. Caso haja barulho excessivo, a primeira recomendação é uma conversa amigável com o vizinho. Se persistir, o porteiro pode ser acionado para registrar a ocorrência.' },
];

const FaqAccordionItem: React.FC<{ item: FaqItem; isOpen: boolean; onClick: () => void; }> = ({ item, isOpen, onClick }) => (
  <div className="border-b border-white/10">
    <button
      onClick={onClick}
      className="w-full flex justify-between items-center text-left py-4 px-2"
    >
      <span className="font-semibold text-white/90">{item.question}</span>
      <ChevronDownIcon className={`w-5 h-5 text-accent transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
      <div className="p-4 bg-black/20 text-white/70 rounded-b-md">
        {item.answer}
      </div>
    </div>
  </div>
);


const FormSuporte: React.FC = () => (
    <div className="bg-white/5 border border-white/10 rounded-lg p-8">
        <h3 className="text-2xl font-bold text-accent text-center">Ainda com dúvidas?</h3>
        <p className="text-center text-white/70 mt-2 mb-6">Entre em contato conosco. Nossa equipe está pronta para ajudar.</p>
        <form className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/80">Nome</label>
                <input type="text" id="name" className="mt-1 w-full bg-white/5 border border-white/20 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80">E-mail</label>
                <input type="email" id="email" className="mt-1 w-full bg-white/5 border border-white/20 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <div>
                <label htmlFor="message" className="block text-sm font-medium text-white/80">Sua dúvida</label>
                <textarea id="message" rows={4} className="mt-1 w-full bg-white/5 border border-white/20 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent"></textarea>
            </div>
            <button type="submit" className="w-full bg-accent text-primary font-bold py-3 rounded-md hover:bg-accent/80 transition-colors">
                Enviar Mensagem
            </button>
        </form>
    </div>
);


const Faq: React.FC = () => {
    const [openId, setOpenId] = useState<number | null>(null);

    const handleToggle = (id: number) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white">Perguntas Frequentes (FAQ)</h2>
                <p className="mt-2 text-white/70">Encontre respostas para as dúvidas mais comuns dos moradores.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-lg p-6">
                    {mockFaq.map(item => (
                        <FaqAccordionItem
                            key={item.id}
                            item={item}
                            isOpen={openId === item.id}
                            onClick={() => handleToggle(item.id)}
                        />
                    ))}
                </div>
                <div className="lg:col-span-2">
                    <FormSuporte />
                </div>
            </div>
        </div>
    );
};

export default Faq;
