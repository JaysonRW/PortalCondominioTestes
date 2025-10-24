
import React, { useState, useMemo, useEffect } from 'react';
import type { Comunicado } from '../../types';
import { SearchIcon } from '../Icons';
import { supabase } from '../../lib/supabase';

const CardComunicado: React.FC<{ comunicado: Comunicado }> = ({ comunicado }) => (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-accent/50 transition-all duration-300 flex flex-col">
        <div className="flex-grow">
            <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-accent">{comunicado.title}</h3>
                <span className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded-full">{new Date(comunicado.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
            <p className="mt-4 text-white/80">{comunicado.summary}</p>
        </div>
        <p className="mt-6 text-sm text-white/60 pt-4 border-t border-white/10">Publicado por: {comunicado.profiles?.full_name || 'Administração'}</p>
    </div>
);

const Comunicados: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComunicados = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('comunicados')
        .select('*, profiles(full_name)');

      if (error) {
        console.error('Error fetching comunicados:', error);
        setError('Não foi possível carregar os comunicados.');
      } else if (data) {
        const sortedData = (data as Comunicado[]).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setComunicados(sortedData);
      }
      setLoading(false);
    };

    fetchComunicados();
  }, []);

  const filteredComunicados = useMemo(() => {
    if (!searchTerm) return comunicados;
    return comunicados.filter(c =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, comunicados]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Mural de Comunicados</h2>
        <p className="mt-2 text-white/70">Mantenha-se informado sobre os últimos acontecimentos do condomínio.</p>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Buscar comunicados..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/5 border border-white/20 rounded-lg py-3 pl-12 pr-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
      </div>

      {loading ? (
        <div className="text-center py-16">
          <p className="text-white/70">Carregando comunicados...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      ) : filteredComunicados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComunicados.map(comunicado => (
            <CardComunicado key={comunicado.id} comunicado={comunicado} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white/5 rounded-lg">
          <p className="text-white/70">
            {searchTerm 
              ? `Nenhum comunicado encontrado com o termo "${searchTerm}".`
              : "Nenhum comunicado publicado ainda."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Comunicados;
