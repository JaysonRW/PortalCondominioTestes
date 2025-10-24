import React, { useState } from 'react';
import type { Page } from '../types';
import { MenuIcon, CloseIcon, LogoutIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const NavLink: React.FC<{
  page: Page;
  activePage: Page;
  onClick: (page: Page) => void;
  children: React.ReactNode;
}> = ({ page, activePage, onClick, children }) => (
  <button
    onClick={() => onClick(page)}
    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
      activePage === page
        ? 'text-accent'
        : 'text-white/80 hover:bg-white/10 hover:text-white'
    }`}
  >
    {children}
  </button>
);

const Navbar: React.FC<NavbarProps> = ({ activePage, setActivePage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { session, signOut, profile } = useAuth();

  const handleNavClick = (page: Page) => {
    setActivePage(page);
    setIsOpen(false);
  };
  
  const handleSignOut = async () => {
    await signOut();
    setActivePage('inicio');
  }

  const navItems: { page: Page; label: string }[] = [
    { page: 'inicio', label: 'Início' },
    { page: 'comunicados', label: 'Comunicados' },
    { page: 'eventos', label: 'Eventos' },
    { page: 'galeria', label: 'Galeria' },
    { page: 'documentos', label: 'Documentos' },
    { page: 'faq', label: 'FAQ' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/80 backdrop-blur-lg border-b border-white/10 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center cursor-pointer" onClick={() => handleNavClick('inicio')}>
            <img src="https://i.ibb.co/FkhJ24JQ/Logos-teste-condominio.png" alt="Logo Raio de Sol" className="h-10 w-auto" />
            <span className="ml-3 text-xl font-bold text-white tracking-wider">Raio de Sol</span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <NavLink key={item.page} page={item.page} activePage={activePage} onClick={handleNavClick}>
                  {item.label}
                </NavLink>
              ))}

              {session && profile?.role === 'sindico' && activePage !== 'acesso-restrito' && (
                 <button
                    onClick={() => handleNavClick('acesso-restrito')}
                    className="ml-4 px-4 py-2 rounded-md text-sm font-medium bg-accent text-primary hover:bg-accent/80 transition-colors duration-300"
                  >
                    Voltar para Painel
                </button>
              )}

              {session ? (
                 <button
                    onClick={handleSignOut}
                    className="ml-4 px-4 py-2 flex items-center rounded-md text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors duration-300"
                  >
                    <LogoutIcon className="w-4 h-4 mr-2" />
                    Sair
                  </button>
              ) : (
                <button
                    onClick={() => handleNavClick('acesso-restrito')}
                    className="ml-4 px-4 py-2 rounded-md text-sm font-medium bg-accent text-primary hover:bg-accent/80 transition-colors duration-300"
                  >
                    Área Restrita
                </button>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <CloseIcon className="block h-6 w-6" /> : <MenuIcon className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => handleNavClick(item.page)}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
                  activePage === item.page
                    ? 'bg-accent text-primary'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}

            {session && profile?.role === 'sindico' && activePage !== 'acesso-restrito' && (
                <button
                  onClick={() => handleNavClick('acesso-restrito')}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-accent text-primary"
                >
                  Voltar para Painel
                </button>
             )}

             {session ? (
                 <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  >
                    Sair
                  </button>
              ) : (
                <button
                  onClick={() => handleNavClick('acesso-restrito')}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                >
                  Área Restrita
                </button>
              )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
