import React, { useState, useEffect } from 'react';
import type { Page } from './types';
import Navbar from './components/Navbar';
import Inicio from './components/pages/Inicio';
import Comunicados from './components/pages/Comunicados';
import Eventos from './components/pages/Eventos';
import Galeria from './components/pages/Galeria';
import Documentos from './components/pages/Documentos';
import Faq from './components/pages/Faq';
import AcessoRestrito from './components/pages/AcessoRestrito';
import Login from './components/pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('inicio');
  const [isLoading, setIsLoading] = useState(true);
  const { session, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [authLoading]);

  useEffect(() => {
    // If the user successfully logs in while on the login page,
    // redirect them to the restricted area.
    if (session && activePage === 'login') {
      setActivePage('acesso-restrito');
    }
  }, [session, activePage]);

  const handleSetPage = (page: Page) => {
    if (page === 'acesso-restrito' && !session) {
      setActivePage('login');
    } else {
      setActivePage(page);
    }
  };
  
  const renderPage = () => {
    switch (activePage) {
      case 'inicio':
        return <Inicio setActivePage={handleSetPage} />;
      case 'comunicados':
        return <Comunicados />;
      case 'eventos':
        return <Eventos />;
      case 'galeria':
        return <Galeria />;
      case 'documentos':
        return <Documentos />;
      case 'faq':
        return <Faq />;
      case 'acesso-restrito':
        if (authLoading) return null;
        return session ? <AcessoRestrito /> : <Login />;
      case 'login':
        return <Login />;
      default:
        return <Inicio setActivePage={handleSetPage} />;
    }
  };
  
  if (isLoading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-primary text-accent">
        <img src="https://i.ibb.co/FkhJ24JQ/Logos-teste-condominio.png" alt="Logo Raio de Sol" className="w-32 h-auto" />
        <h1 className="mt-4 text-2xl font-bold tracking-wider">Condomínio Raio de Sol</h1>
        <p className="text-white/70">Carregando portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary text-white font-sans flex flex-col">
      <Navbar activePage={activePage} setActivePage={handleSetPage} />
      <main className="pt-20 flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderPage()}
        </div>
      </main>
      <footer className="bg-black/20 text-center py-4 text-white/50 text-sm">
        <p>&copy; {new Date().getFullYear()} Condomínio Raio de Sol. Todos os direitos reservados.</p>
        <p className="mt-1">
          Desenvolvido por <a href="https://propagounegocios.com.br" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent transition-colors">propagounegocios.com.br</a>
        </p>
      </footer>
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
