import React, { useState, useEffect, useCallback } from 'react';
import type { Documento } from '../../types';
import { DocumentIcon, DownloadIcon } from '../Icons';
import { supabase } from '../../lib/supabase';

const Documentos: React.FC = () => {
    const [documentos, setDocumentos] = useState<Documento[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDocumentos = useCallback(async () => {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
            .from('documentos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching documents:', error);
            setError('Não foi possível carregar os documentos.');
            setDocumentos([]);
        } else if (data) {
            const documentsWithUrls = data.map(doc => {
                const { data: { publicUrl } } = supabase
                    .storage
                    .from('documentos')
                    .getPublicUrl(doc.file_path);
                return { ...doc, url: publicUrl };
            });
            setDocumentos(documentsWithUrls as Documento[]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchDocumentos();
    }, [fetchDocumentos]);
  
    const renderContent = () => {
      if (loading) {
        return <div className="text-center py-10 text-white/70">Carregando documentos...</div>;
      }
      if (error) {
        return <div className="text-center py-10 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">{error}</div>;
      }
      if (documentos.length === 0) {
        return <div className="text-center py-10 bg-white/5 rounded-lg text-white/70">Nenhum documento disponível no momento.</div>;
      }

      return (
        <div className="space-y-3">
            {documentos.map(doc => (
                <div key={doc.id} className="flex items-center justify-between bg-white/5 p-3 rounded-md hover:bg-white/10 transition-colors duration-200 group">
                    <div className="flex items-center overflow-hidden">
                        <DocumentIcon className="w-6 h-6 text-accent/80 mr-4 flex-shrink-0" />
                        <div className="overflow-hidden">
                            <p className="font-semibold text-white truncate">{doc.name}</p>
                            <p className="text-xs text-white/60">
                                {new Date(doc.created_at).toLocaleDateString('pt-BR')} - {doc.file_size_kb} KB
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center flex-shrink-0 ml-4">
                        <a href={doc.url} download={doc.name} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-white/70 hover:bg-accent hover:text-primary transition-colors duration-200">
                            <DownloadIcon className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            ))}
        </div>
      );
    }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Documentos Importantes</h2>
        <p className="mt-2 text-white/70">Acesse atas, regulamentos e outros arquivos relevantes.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-accent">Arquivos Disponíveis</h3>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default Documentos;