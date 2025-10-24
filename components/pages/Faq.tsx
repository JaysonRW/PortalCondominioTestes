
import React, { useState, useEffect } from 'react';
import type { FaqItem } from '../../types';
import { ChevronDownIcon } from '../Icons';
import { supabase } from '../../lib/supabase';

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
    const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFaq = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('faq_items')
                .select('*');

            if (error) {
                console.error("Error fetching FAQ", error);
            } else if (data) {
                const sortedData = (data as FaqItem[]).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setFaqItems(sortedData);
            }
            setLoading(false);
        };
        fetchFaq();
    }, []);

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
                    {loading ? <p className="text-white/70">Carregando perguntas...</p> : 
                    faqItems.length > 0 ? faqItems.map(item => (
                        <FaqAccordionItem
                            key={item.id}
                            item={item}
                            isOpen={openId === item.id}
                            onClick={() => handleToggle(item.id)}
                        />
                    )) : <p className="text-white/70 text-center py-4">Nenhuma pergunta frequente cadastrada.</p>}
                </div>
                <div className="lg:col-span-2">
                    <FormSuporte />
                </div>
            </div>
        </div>
    );
};

export default Faq;
