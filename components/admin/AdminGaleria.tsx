
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import type { GaleriaItem } from '../../types';
import { PlusIcon, TrashIcon, CloseIcon, UploadIcon } from '../Icons';

const AdminGaleria: React.FC = () => {
    const [images, setImages] = useState<GaleriaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    const [altText, setAltText] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fetchImages = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('galeria_imagens')
            .select('*');

        if (error) {
            setError('Falha ao carregar imagens.');
        } else if (data) {
            const sortedData = (data as GaleriaItem[]).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            const itemsWithUrls = sortedData.map(item => {
                const { data: { publicUrl } } = supabase.storage.from('galeria').getPublicUrl(item.image_path);
                return { ...item, url: publicUrl };
            });
            setImages(itemsWithUrls as GaleriaItem[]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);
    
    const handleOpenModal = () => {
        setIsModalOpen(true);
        setError(null);
        setAltText('');
        setSelectedFile(null);
        const fileInput = document.getElementById('image-upload-admin') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleCloseModal = () => {
        if(uploading) return;
        setIsModalOpen(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !altText) return;
        
        setUploading(true);
        setError(null);
        
        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `public/gallery_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage.from('galeria').upload(filePath, selectedFile);
            
        if (uploadError) {
            setError(`Falha no upload: ${uploadError.message}`);
            setUploading(false);
            return;
        }

        const { error: insertError } = await supabase.from('galeria_imagens').insert({ alt_text: altText, image_path: filePath });
            
        if (insertError) {
            setError(`Falha ao salvar registro: ${insertError.message}`);
            await supabase.storage.from('galeria').remove([filePath]);
        } else {
            handleCloseModal();
            await fetchImages();
        }
        setUploading(false);
    };

    const handleDelete = async (image: GaleriaItem) => {
        if (!window.confirm(`Tem certeza que deseja excluir esta imagem?`)) return;
        await supabase.storage.from('galeria').remove([image.image_path]);
        await supabase.from('galeria_imagens').delete().eq('id', image.id);
        await fetchImages();
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-accent">Gerenciar Galeria</h3>
                <button onClick={handleOpenModal} className="flex items-center bg-accent text-primary px-4 py-2 rounded-md font-semibold hover:bg-accent/80 transition-colors">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Adicionar Imagem
                </button>
            </div>

            {loading && <p>Carregando...</p>}
            {error && !isModalOpen && <p className="text-red-400 bg-red-500/10 p-3 rounded-md">{error}</p>}
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map(image => (
                    <div key={image.id} className="relative group">
                        <img src={image.url} alt={image.alt_text} className="w-full h-40 object-cover rounded-md"/>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                            <button onClick={() => handleDelete(image)} className="p-3 bg-red-600/80 rounded-full text-white hover:bg-red-500">
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-primary border border-white/20 rounded-lg p-6 w-full max-w-lg relative">
                        <button onClick={handleCloseModal} className="absolute top-4 right-4 text-white/70 hover:text-white disabled:opacity-50" disabled={uploading}><CloseIcon className="w-6 h-6" /></button>
                        <h3 className="text-2xl font-bold text-accent mb-4">Adicionar Imagem</h3>
                        {error && <p className="text-red-400 bg-red-500/10 p-3 rounded-md mb-4">{error}</p>}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="alt-text" className="block text-sm font-medium text-white/80">Descrição da Imagem</label>
                                <input id="alt-text" type="text" value={altText} onChange={e => setAltText(e.target.value)} className="mt-1 w-full bg-white/10 border border-white/20 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent" required disabled={uploading} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/80">Arquivo</label>
                                <div className="mt-1 flex items-center space-x-4 p-2 bg-white/10 rounded-md">
                                    <label htmlFor="image-upload-admin" className="cursor-pointer bg-accent text-primary px-3 py-2 text-sm font-semibold rounded-md hover:bg-accent/80">
                                        <span>Escolher Arquivo</span>
                                        <input id="image-upload-admin" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} disabled={uploading} />
                                    </label>
                                    <p className="text-sm text-white/70 truncate">{selectedFile ? selectedFile.name : 'Nenhum arquivo selecionado'}</p>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-4 pt-4">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded-md text-white/80 hover:bg-white/10 disabled:opacity-50" disabled={uploading}>Cancelar</button>
                                <button type="submit" className="px-6 py-2 bg-accent text-primary font-bold rounded-md hover:bg-accent/80 disabled:bg-accent/50 disabled:cursor-not-allowed" disabled={uploading || !selectedFile || !altText}>
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

export default AdminGaleria;
