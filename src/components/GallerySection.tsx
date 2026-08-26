import React, { useState } from 'react';
import { Camera, X, Maximize2, Sparkles } from 'lucide-react';
import { GalleryItem } from '../types';
import { formatCategoryLabel } from '../utils/sanitize';
import { sanitizeImageUrl } from '../utils/sanitize';

interface GallerySectionProps {
  gallery: GalleryItem[];
  /** Admin-managed list, so new categories appear as filters automatically. */
  categories?: string[];
}

export const GallerySection: React.FC<GallerySectionProps> = ({ gallery, categories = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeImage, setActiveImage] = useState<GalleryItem | null>(null);

  const filteredGallery = selectedCategory === 'all'
    ? gallery
    : gallery.filter((g) => g.category === selectedCategory);

  return (
    <section id="gallery" className="py-16 bg-stone-900 text-white relative border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-black uppercase tracking-wider">
            <Camera className="w-4 h-4 text-amber-400" />
            <span>EVENT PHOTO GALLERY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white uppercase">
            EXPERIENCE THE <span className="text-orange-500">ATMOSPHERE</span>
          </h2>
          <p className="text-stone-300 text-sm sm:text-base">
            Highlights and memorable moments from Kosua Ne Meko street food culture, music stage, and games.
          </p>

          {/* Category Filter Tabs */}
          <div className="pt-4 flex flex-wrap justify-center gap-2">
            {[
              { id: 'all', label: 'All Photos' },
              // Only offer filters that actually match photos in the gallery.
              ...categories
                .filter((c) => gallery.some((item) => item.category === c))
                .map((c) => ({ id: c, label: formatCategoryLabel(c) })),
            ].map((cat) => (
              <button
                id={`btn-gallery-filter-${cat.id}`}
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGallery.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveImage(item)}
              className="group relative h-64 rounded-3xl overflow-hidden cursor-pointer border border-stone-800 shadow-xl bg-stone-950 transform transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/60"
            >
              <img
                src={sanitizeImageUrl(item.imageUrl)}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              
              <div className="absolute bottom-0 inset-x-0 p-5 space-y-1">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-orange-600 text-white rounded-md w-fit inline-block">
                  {item.category}
                </span>
                <h4 className="text-base font-black text-white group-hover:text-orange-400 transition-colors uppercase font-display">
                  {item.title}
                </h4>
                {item.caption && (
                  <p className="text-xs text-stone-300 line-clamp-1">
                    {item.caption}
                  </p>
                )}
              </div>

              <div className="absolute top-4 right-4 p-2 rounded-xl bg-black/60 backdrop-blur text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {activeImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setActiveImage(null)}>
            <div className="relative max-w-4xl w-full bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <button
                id="btn-gallery-lightbox-close"
                onClick={() => setActiveImage(null)}
                className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-stone-800/80 hover:bg-stone-700 text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="max-h-[75vh] overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={sanitizeImageUrl(activeImage.imageUrl)}
                  alt={activeImage.title}
                  referrerPolicy="no-referrer"
                  className="max-h-[75vh] w-auto max-w-full object-contain"
                />
              </div>

              <div className="p-6 bg-stone-900 border-t border-stone-800 space-y-2">
                <span className="text-xs font-black uppercase px-2.5 py-1 bg-orange-600 text-white rounded-md inline-block">
                  {activeImage.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase font-display">
                  {activeImage.title}
                </h3>
                {activeImage.caption && (
                  <p className="text-sm text-stone-300 leading-relaxed">
                    {activeImage.caption}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
