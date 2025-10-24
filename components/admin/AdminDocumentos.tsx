import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Documento } from '../../types';
import { PlusIcon, TrashIcon, CloseIcon, UploadIcon, DownloadIcon } from '../Icons';

const AdminDocumentos: React.FC = () => {
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
        const fileInput = document.getElementById('file-upload-admin') as HTMLInputElement;
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
            await supabase.storage.from('documentos').remove([filePath]);
        } else {
            handleCloseModal();
            await fetchDocumentos();
        }
        setUploading(false);
    };

    const handleDelete = async (doc: Documento) => {
        if (!window.confirm(`Tem certeza que deseja excluir o documento "${doc.name}"?`)) return;

        await supabase.storage.from('documentos').remove([doc.file_path]);
        await supabase.from('documentos').delete().eq('id', doc.id);
        
        await fetchDocumentos();
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-accent">Gerenciar Documentos</h3>
                <button onClick={handleOpenModal} className="flex items-center bg-accent text-primary px-4 py-2 rounded-md font-semibold hover:bg-accent/80 transition-colors">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Adicionar
                </button>
            </div>

            {loading && <p>Carregando...</p>}
            {error && !isModalOpen && <p className="text-red-400 bg-red-500/10 p-3 rounded-md">{error}</p>}
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/20 text-white/70">
                            <th className="p-3">Nome</th>
                            <th className="p-3 hidden md:table-cell">Data</th>
                            <th className="p-3 hidden sm:table-cell">Tamanho</th>
                            <th className="p-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documentos.map(doc => (
                            <tr key={doc.id} className="border-b border-white/10 hover:bg-white/5">
                                <td className="p-3 font-semibold">{doc.name}</td>
                                <td className="p-3 hidden md:table-cell text-sm text-white/70">{new Date(doc.created_at).toLocaleDateString('pt-BR')}</td>
                                <td className="p-3 hidden sm:table-cell text-sm text-white/70">{doc.file_size_kb} KB</td>
                                <td className="p-3 text-right">
                                    <a href={doc.url} download={doc.name} target="_blank" rel="noopener noreferrer" className="p-2 inline-block text-white/70 hover:text-accent"><DownloadIcon className="w-5 h-5"/></a>
                                    <button onClick={() => handleDelete(doc)} className="p-2 text-white/70 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
                                <input id="doc-name" type="text" value={formName} onChange={e => setFormName(e.target.value)} className="mt-1 w-full bg-white/10 border border-white/20 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50" required disabled={uploading} />
                            </div>
                            <div>
                                <label htmlFor="file-upload-admin" className="block text-sm font-medium text-white/80">Arquivo</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-white/20 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        <UploadIcon className="mx-auto h-12 w-12 text-white/50" />
                                        <div className="flex text-sm text-white/60">
                                            <label htmlFor="file-upload-admin" className="relative cursor-pointer bg-primary rounded-md font-medium text-accent hover:text-accent/80">
                                                <span>Carregar um arquivo</span>
                                                <input id="file-upload-admin" name="file-upload-admin" type="file" className="sr-only" onChange={handleFileChange} disabled={uploading} />
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

export default AdminDocumentos;
