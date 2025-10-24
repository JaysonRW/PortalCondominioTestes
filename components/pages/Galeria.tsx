
import React from 'react';

const images = [
  { id: 1, src: 'https://picsum.photos/800/600?random=10', alt: 'Evento no condomínio' },
  { id: 2, src: 'https://picsum.photos/800/600?random=11', alt: 'Área da piscina' },
  { id: 3, src: 'https://picsum.photos/800/600?random=12', alt: 'Jardim florido' },
  { id: 4, src: 'https://picsum.photos/800/600?random=13', alt: 'Salão de festas decorado' },
  { id: 5, src: 'https://picsum.photos/800/600?random=14', alt: 'Vista aérea do condomínio' },
  { id: 6, src: 'https://picsum.photos/800/600?random=15', alt: 'Playground infantil' },
  { id: 7, src: 'https://picsum.photos/800/600?random=16', alt: 'Academia equipada' },
  { id: 8, src: 'https://picsum.photos/800/600?random=17', alt: 'Decoração de Natal' },
];

const Galeria: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Galeria de Fotos</h2>
        <p className="mt-2 text-white/70">Relembre os melhores momentos e conheça os espaços do nosso condomínio.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div key={image.id} className="group relative overflow-hidden rounded-lg">
            <img 
              src={image.src} 
              alt={image.alt} 
              className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <p className="text-white text-sm font-semibold">{image.alt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Galeria;
