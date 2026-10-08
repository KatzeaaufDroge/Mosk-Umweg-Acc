import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import Masonry from 'react-masonry-css';
import { BlurFade } from './ui/blur-fade';
import {
  galleryAreas,
  optimizedSrc,
  optimizedSrcSet,
  type GalleryCategory,
  type GalleryItem,
} from '../data/gallery';

const ALL = 'alle';

interface LightboxProps {
  item: GalleryItem;
  index: number;
  total: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

function Lightbox({ item, index, total, onClose, onNext, onPrev }: LightboxProps) {
  const [playing, setPlaying] = useState(false);
  useEffect(() => setPlaying(false), [item]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight') onNext();
    if (e.key === 'ArrowLeft') onPrev();
  };

  const touchStartXRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const startX = touchStartXRef.current;
    const endX = e.changedTouches[0]?.clientX;
    touchStartXRef.current = null;
    if (startX === null || endX === undefined) return;
    if (startX - endX > 50) onNext();
    if (endX - startX > 50) onPrev();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
    >
      <div
        className="relative w-full h-full flex items-center justify-center px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors duration-200"
          aria-label="Close lightbox"
        >
          <X size={24} className="text-white sm:w-7 sm:h-7" />
        </button>

        {item.video && playing ? (
          <div className="w-full max-w-5xl aspect-video px-2 sm:px-0">
            <iframe
              src={item.video}
              title={item.alt}
              className="w-full h-full rounded-lg"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="relative flex items-center justify-center">
            <img
              src={optimizedSrc(item.src, 2000)}
              alt={item.alt}
              className="max-w-full max-h-[90vh] object-contain px-2 sm:px-0"
            />
            {item.video && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/30">
                <button
                  onClick={() => setPlaying(true)}
                  className="flex items-center gap-2 bg-brand hover:bg-brand-light text-black font-bold rounded-full pl-5 pr-6 py-3 transition-colors"
                >
                  <Play size={20} fill="currentColor" />
                  Video abspielen
                </button>
                <p className="text-xs text-white/70 max-w-xs text-center px-4">
                  Beim Abspielen wird das Video von YouTube bzw. Vimeo geladen.
                </p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={onPrev}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-lg p-2 sm:p-3 transition-colors duration-200"
          aria-label="Previous image"
        >
          <ChevronLeft size={24} className="text-white sm:w-8 sm:h-8" />
        </button>

        <button
          onClick={onNext}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-lg p-2 sm:p-3 transition-colors duration-200"
          aria-label="Next image"
        >
          <ChevronRight size={24} className="text-white sm:w-8 sm:h-8" />
        </button>

        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1 sm:px-4 sm:py-2 text-white text-xs sm:text-sm">
          {index + 1} / {total}
        </div>
      </div>
    </div>
  );
}

interface TileProps {
  item: GalleryItem;
  onOpen: () => void;
  fill: boolean;
}

// Bild-Kachel. fill = Kachel füllt eine feste Rasterzelle (object-cover),
// sonst natürliche Höhe (Mosaik).
function Tile({ item, onOpen, fill }: TileProps) {
  const big = item.size !== 'normal';
  return (
    <div
      onClick={onOpen}
      className={`group relative overflow-hidden rounded-lg cursor-pointer shadow-md hover:shadow-lg transition-shadow duration-300 ${
        fill ? `gallery-tile gallery-tile--${item.size}` : 'mb-4 sm:mb-5 lg:mb-6'
      }`}
    >
      <img
        src={optimizedSrc(item.src, big ? 1400 : 900)}
        srcSet={optimizedSrcSet(item.src, [480, 900, 1400, 2000])}
        sizes={
          big
            ? '(min-width: 1024px) 66vw, 100vw'
            : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
        }
        alt={item.alt}
        className={`w-full transition-transform duration-300 group-hover:scale-105 ${
          fill ? 'h-full object-cover' : 'h-auto object-contain'
        }`}
        loading="lazy"
        decoding="async"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
      {item.video ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-brand text-black rounded-full p-4 shadow-lg shadow-black/40 group-hover:scale-110 transition-transform duration-300">
            <Play size={24} fill="currentColor" />
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 group-hover:bg-white/30 transition-colors">
            <ChevronRight size={24} className="text-white" />
          </div>
        </div>
      )}
    </div>
  );
}

interface CategoryGridProps {
  category: GalleryCategory;
  offset: number;
  onOpen: (index: number) => void;
}

function CategoryGrid({ category, offset, onOpen }: CategoryGridProps) {
  if (category.layout === 'mosaik') {
    return (
      <Masonry
        breakpointCols={{ default: 3, 1024: 2, 640: 1 }}
        className="masonry-grid"
        columnClassName="masonry-grid-column"
      >
        {category.items.map((item, i) => (
          <Tile key={`${item.src}-${i}`} item={item} fill={false} onOpen={() => onOpen(offset + i)} />
        ))}
      </Masonry>
    );
  }

  return (
    <div className="gallery-grid-wrap">
      <div className="gallery-grid">
        {category.items.map((item, i) => (
          <Tile key={`${item.src}-${i}`} item={item} fill onOpen={() => onOpen(offset + i)} />
        ))}
      </div>
    </div>
  );
}

// Umschalter erscheinen nur, wenn es mehr als eine Auswahl gibt
function FilterBar({
  options,
  active,
  onChange,
  size,
  label,
}: {
  options: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
  size: 'lg' | 'sm';
  label: string;
}) {
  if (options.length < 2) return null;
  return (
    <div className="flex justify-center" role="group" aria-label={label}>
      <div
        className={
          size === 'lg'
            ? 'inline-flex flex-wrap justify-center gap-1 p-1 rounded-full bg-black/60 border border-white/10'
            : 'flex flex-wrap justify-center gap-2'
        }
      >
        {options.map((o) => {
          const on = o.id === active;
          const cls =
            size === 'lg'
              ? `px-5 sm:px-7 py-2.5 rounded-full text-sm sm:text-base font-semibold transition-colors ${
                  on ? 'bg-brand text-black' : 'text-white/70 hover:text-white hover:bg-brand/15'
                }`
              : `px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  on
                    ? 'border-brand bg-brand/15 text-white'
                    : 'border-white/15 text-white/70 hover:text-white hover:border-brand/60'
                }`;
          return (
            <button key={o.id} type="button" aria-pressed={on} onClick={() => onChange(o.id)} className={cls}>
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Gallery() {
  const [areaName, setAreaName] = useState(galleryAreas[0]?.name ?? '');
  const [categoryId, setCategoryId] = useState(ALL);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const area = galleryAreas.find((a) => a.name === areaName) ?? galleryAreas[0];
  const shownCategories: GalleryCategory[] = area
    ? area.categories.filter((c) => categoryId === ALL || c.id === categoryId)
    : [];
  // Lightbox blättert durch alles, was gerade angezeigt wird
  const galleryItems: GalleryItem[] = shownCategories.flatMap((c) => c.items);

  const chooseArea = (name: string) => {
    setAreaName(name);
    setCategoryId(ALL);
    setSelectedIndex(null);
  };

  const chooseCategory = (id: string) => {
    setCategoryId(id);
    setSelectedIndex(null);
  };

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < galleryItems.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handlePrev = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const showCategoryTitles = shownCategories.length > 1;
  let offset = 0;

  return (
    <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-24 overflow-hidden" style={{ backgroundColor: '#262626' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BlurFade delay={0.25} inView sessionKey="gallery-header">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-normal text-white mb-4 sm:mb-6">
              Galerie
            </h1>
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
              Ein Einblick in meine besten Werke
            </p>
          </div>
        </BlurFade>

        {(galleryAreas.length > 1 || (area && area.categories.length > 1)) && (
          <div className="space-y-4 mb-10 sm:mb-14">
            <FilterBar
              label="Bereich"
              size="lg"
              active={area?.name ?? ''}
              onChange={chooseArea}
              options={galleryAreas.map((a) => ({ id: a.name, label: a.name }))}
            />
            {area && area.categories.length > 1 && (
              <FilterBar
                label="Kategorie"
                size="sm"
                active={categoryId}
                onChange={chooseCategory}
                options={[{ id: ALL, label: 'Alle' }, ...area.categories.map((c) => ({ id: c.id, label: c.title }))]}
              />
            )}
          </div>
        )}

        <BlurFade delay={0.5} inView sessionKey="gallery-grid">
          {shownCategories.length === 0 ? (
            <p className="text-center text-gray-400 py-16">Bald gibt es hier neue Arbeiten zu sehen.</p>
          ) : (
            <div className="space-y-12 sm:space-y-16">
              {shownCategories.map((category) => {
                const start = offset;
                offset += category.items.length;
                return (
                  <div key={category.id}>
                    {showCategoryTitles && (
                      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">{category.title}</h2>
                    )}
                    <CategoryGrid category={category} offset={start} onOpen={setSelectedIndex} />
                  </div>
                );
              })}
            </div>
          )}
        </BlurFade>

      </div>

      {selectedIndex !== null && galleryItems[selectedIndex] && (
        <Lightbox
          item={galleryItems[selectedIndex]}
          index={selectedIndex}
          total={galleryItems.length}
          onClose={() => setSelectedIndex(null)}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}
    </section>
  );
}
