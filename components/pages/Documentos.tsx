import React, { useState, useEffect, useCallback } from 'react';
import type { Documento } from '../../types';
import { DocumentIcon, DownloadIcon, PlusIcon, TrashIcon, CloseIcon, UploadIcon } from '../Icons';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const Documentos: React.FC = () => {
    const { profile } = useAuth();
    const [documentos, setDocumentos] = useState<Documento[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    const [formName, setFormName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fetchDocumentos = useCallback(async () => {
        setLoading(true);
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
    
    const handleOpenModal = () => {
        setIsModalOpen(true);
        setError(null);
        setFormName('');
        setSelectedFile(null);
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if(fileInput) fileInput.value = '';
    }

    const handleCloseModal = () => {
        if(uploading) return;
        setIsModalOpen(false);
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setFormName(file.name.substring(0, file.name.lastIndexOf('.')) || file.name);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !formName || !profile) return;
        
        setUploading(true);
        setError(null);
        
        const fileExt = selectedFile.name.split('.').pop();
        const cleanFileName = formName.replace(/[^a-zA-Z0-9_.-]/g, '_');
        const filePath = `public/${cleanFileName}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('documentos')
            .upload(filePath, selectedFile);
            
        if (uploadError) {
            setError(`Falha no upload: ${uploadError.message}`);
            setUploading(false);
            return;
        }

        const { error: insertError } = await supabase
            .from('documentos')
            .insert({
                name: formName,
                file_path: filePath,
                file_size_kb: Math.round(selectedFile.size / 1024),
                uploader_id: profile.id
            });
            
        if (insertError) {
            setError(`Falha ao salvar registro: ${insertError.message}`);
            await supabase.storage.from('documentos').remove([filePath]); // Cleanup
        } else {
            handleCloseModal();
            await fetchDocumentos();
        }
        setUploading(false);
    };

    const handleDelete = async (doc: Documento) => {
        if (!window.confirm(`Tem certeza que deseja excluir o documento "${doc.name}"?`)) return;

        const { error: storageError } = await supabase.storage
            .from('documentos')
            .remove([doc.file_path]);
            
        if (storageError) {
            console.error('Storage delete error:', storageError);
            alert(`Falha ao remover o arquivo do armazenamento: ${storageError.message}. O registro do banco de dados ainda será removido.`);
        }

        const { error: dbError } = await supabase
            .from('documentos')
            .delete()
            .eq('id', doc.id);

        if (dbError) {
            alert(`Falha ao excluir o registro do documento: ${dbError.message}`);
        } else {
            await fetchDocumentos();
        }
    };
  
    const renderContent = () => {
      if (loading) {
        return <div className="text-center py-10 text-white/70">Carregando documentos...</div>;
      }
      if (error && documentos.length === 0) {
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
                    {profile?.role === 'sindico' && (
                        <button onClick={() => handleDelete(doc)} className="p-2 rounded-full text-white/70 hover:bg-red-500/20 hover:text-red-400 transition-colors duration-200 opacity-0 group-hover:opacity-100">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    )}
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
            {profile?.role === 'sindico' && (
                <button onClick={handleOpenModal} className="flex items-center bg-accent text-primary px-4 py-2 rounded-md font-semibold hover:bg-accent/80 transition-colors">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Adicionar
                </button>
            )}
        </div>
        {renderContent()}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-primary border border-white/20 rounded-lg p-6 w-full max-w-lg relative">
                <button onClick={handleCloseModal} className="absolute top-4 right-4 text-white/70 hover:text-white disabled:opacity-50" disabled={uploading}>
                    <CloseIcon className="w-6 h-6" />
                </button>
                <h3 className="text-2xl font-bold text-accent mb-4">Adicionar Documento</h3>
                {error && <p className="text-red-400 bg-red-500/10 p-3 rounded-md mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="doc-name" className="block text-sm font-medium text-white/80">Nome do Documento</label>
                        <input
                            id="doc-name"
                            type="text"
                            value={formName}
                            onChange={e => setFormName(e.target.value)}
                            className="mt-1 w-full bg-white/10 border border-white/20 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                            required
                            disabled={uploading}
                        />
                    </div>
                    <div>
                        <label htmlFor="file-upload" className="block text-sm font-medium text-white/80">Arquivo</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-white/20 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <UploadIcon className="mx-auto h-12 w-12 text-white/50" />
                                <div className="flex text-sm text-white/60">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-primary rounded-md font-medium text-accent hover:text-accent/80 focus-within:outline-none">
                                        <span>Carregar um arquivo</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} disabled={uploading} />
                                    </label>
                                    <p className="pl-1">ou arraste e solte</p>
                                </div>
                                <p className="text-xs text-white/50">{selectedFile ? selectedFile.name : 'Nenhum arquivo selecionado'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded-md text-white/80 hover:bg-white/10 disabled:opacity-50" disabled={uploading}>Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-accent text-primary font-bold rounded-md hover:bg-accent/80 disabled:bg-accent/50 disabled:cursor-not-allowed" disabled={uploading || !selectedFile || !formName}>
                            {uploading ? 'Enviando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Documentos;