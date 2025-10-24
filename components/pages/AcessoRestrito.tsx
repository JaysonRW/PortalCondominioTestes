import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { SunIcon } from '../Icons';
import type { AdminTab } from '../../types';
import AdminComunicados from '../admin/AdminComunicados';

const AdminDashboard: React.FC = () => {
    const { profile } = useAuth();
    const [activeTab, setActiveTab] = useState<AdminTab>('comunicados');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'comunicados':
                return <AdminComunicados />;
            case 'eventos':
            case 'documentos':
            case 'galeria':
            case 'faq':
                return <div className="text-center p-8 bg-white/5 rounded-lg">Em desenvolvimento...</div>;
            default:
                return null;
        }
    }

    const TabButton: React.FC<{tab: AdminTab, label: string}> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab 
                ? 'bg-accent text-primary' 
                : 'text-white/70 hover:bg-white/10'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-white">Painel do Síndico</h2>
                <p className="mt-1 text-white/70">
                    Bem-vindo(a), <span className="font-bold text-accent">{profile?.full_name}</span>. Gerencie o portal aqui.
                </p>
            </div>
            <div className="border-b border-white/10 pb-2 flex space-x-2">
               <TabButton tab="comunicados" label="Comunicados" />
               <TabButton tab="eventos" label="Eventos" />
               <TabButton tab="documentos" label="Documentos" />
               <TabButton tab="galeria" label="Galeria" />
               <TabButton tab="faq" label="FAQ" />
            </div>
            <div>
                {renderTabContent()}
            </div>
        </div>
    );
};

const MoradorView: React.FC = () => {
    const { profile } = useAuth();
    return (
        <div className="space-y-8 flex flex-col items-center text-center">
            <SunIcon className="w-24 h-24 text-accent" />
            <h2 className="text-3xl font-bold text-white">
                Bem-vindo(a) de volta, <span className="text-accent">{profile?.full_name || 'Morador'}</span>!
            </h2>
            <p className="mt-2 text-white/70 max-w-lg">
                Esta é sua área de acesso. Explore o portal para se manter atualizado sobre comunicados, eventos e documentos do condomínio.
            </p>
        </div>
    );
}

const AcessoRestrito: React.FC = () => {
    const { profile, loading } = useAuth();

    if (loading) {
        return <div className="text-center text-white/70">Verificando acesso...</div>
    }

    return profile?.role === 'sindico' ? <AdminDashboard /> : <MoradorView />;
};

export default AcessoRestrito;