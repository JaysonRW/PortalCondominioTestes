
import React from 'react';
import type { Page } from '../../types';
import { CalendarIcon, DocumentIcon } from '../Icons';

interface InicioProps {
  setActivePage: (page: Page) => void;
}

const HeroSection: React.FC = () => (
  <div className="relative rounded-lg overflow-hidden h-96 -mt-8 -mx-4 sm:-mx-6 lg:-mx-8">
    <img src="https://i.ibb.co/pB58zdyZ/Image-fx-1.jpg" alt="Condomínio Raio de Sol" className="w-full h-full object-cover"/>
    <div className="absolute inset-0 bg-gradient-to-t from-primary to-transparent"></div>
    <div className="absolute inset-0 bg-primary/50"></div>
    <div className="absolute bottom-0 left-0 p-8 md:p-12">
      <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight shadow-lg">
        Bem-vindo ao <span className="text-accent">Raio de Sol</span>
      </h1>
      <p className="mt-4 text-lg md:text-xl text-white/80 max-w-2xl">
        Seu portal exclusivo para uma vida em condomínio mais conectada e transparente.
      </p>
    </div>
  </div>
);

const QuickAccessCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ title, description, icon, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white/5 backdrop-blur-sm p-6 rounded-lg border border-white/10 hover:bg-white/10 hover:border-accent/50 cursor-pointer transition-all duration-300 group"
  >
    <div className="flex items-start">
      <div className="bg-accent/20 p-3 rounded-lg text-accent group-hover:bg-accent group-hover:text-primary transition-colors duration-300">
        {icon}
      </div>
      <div className="ml-4">
        <h3 className="text-lg font-bold text-white group-hover:text-accent transition-colors duration-300">{title}</h3>
        <p className="mt-1 text-sm text-white/70">{description}</p>
      </div>
    </div>
  </div>
);

const Inicio: React.FC<InicioProps> = ({ setActivePage }) => {
  return (
    <div className="space-y-12">
      <HeroSection />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
        <QuickAccessCard
          title="Últimos Comunicados"
          description="Fique por dentro das notícias e avisos importantes."
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.5" /></svg>}
          onClick={() => setActivePage('comunicados')}
        />
        <QuickAccessCard
          title="Próximos Eventos"
          description="Veja o calendário de eventos e participe."
          icon={<CalendarIcon className="h-6 w-6" />}
          onClick={() => setActivePage('eventos')}
        />
        <QuickAccessCard
          title="Documentos Úteis"
          description="Acesse atas, regulamentos e outros arquivos."
          icon={<DocumentIcon className="h-6 w-6" />}
          onClick={() => setActivePage('documentos')}
        />
      </div>

      <div className="bg-white/5 border border-white/10 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-accent">Precisa de Ajuda?</h2>
          <p className="mt-2 text-white/70 max-w-xl mx-auto">
            Nossa seção de Perguntas Frequentes (FAQ) está aqui para ajudar. Se não encontrar o que procura, entre em contato conosco.
          </p>
          <button
            onClick={() => setActivePage('faq')}
            className="mt-6 px-8 py-3 bg-accent text-primary font-bold rounded-lg hover:bg-accent/80 transition-transform transform hover:scale-105"
          >
            Acessar Suporte
          </button>
      </div>
    </div>
  );
};

export default Inicio;