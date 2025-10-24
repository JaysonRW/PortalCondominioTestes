
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { GaleriaItem } from '../../types';

const Galeria: React.FC = () => {
  const [images, setImages] = useState<GaleriaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('galeria_imagens')
        .select('*');

      if (error) {
        console.error("Error fetching gallery images", error);
      } else if (data) {
        const sortedData = (data as GaleriaItem[]).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const itemsWithUrls = sortedData.map(item => {
          const { data: { publicUrl } } = supabase
            .storage
            .from('galeria')
            .getPublicUrl(item.image_path);
          return { ...item, url: publicUrl };
        });
        setImages(itemsWithUrls as GaleriaItem[]);
      }
      setLoading(false);
    };

    fetchImages();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Galeria de Fotos</h2>
        <p className="mt-2 text-white/70">Relembre os melhores momentos e conheça os espaços do nosso condomínio.</p>
      </div>
      
      {loading ? <p className="text-white/70 text-center">Carregando imagens...</p> :
      images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="group relative overflow-hidden rounded-lg">
              <img 
                src={image.url} 
                alt={image.alt_text} 
                className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-white text-sm font-semibold">{image.alt_text}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white/5 rounded-lg">
          <p className="text-white/70">Nenhuma imagem na galeria ainda.</p>
        </div>
      )}
    </div>
  );
};

export default Galeria;
