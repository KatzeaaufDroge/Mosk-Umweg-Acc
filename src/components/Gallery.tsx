import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, LayoutGrid, Play, X } from 'lucide-react';
import Masonry from 'react-masonry-css';
import { BlurFade } from './ui/blur-fade';
import { getNavHeight } from '../lib/utils';
import {
  galleryAreaCards,
  optimizedSrc,
  optimizedSrcSet,
  type GalleryAreaCard,
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

// Bilder auf den Bereichs-Karten wechseln langsam von selbst. Die Karten
// starten versetzt, damit nicht alle gleichzeitig umblenden.
const CYCLE_MS = 6000;

function useCycle(length: number, startDelay: number): number {
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let interval: number | undefined;
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        if (!document.hidden) setActive((n) => (n + 1) % length);
      }, CYCLE_MS);
    }, startDelay);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [length, startDelay]);
  return active;
}

function AreaCard({ area, index, onOpen }: { area: GalleryAreaCard; index: number; onOpen: () => void }) {
  const active = useCycle(area.previews.length, index * 1700);
  // Bilder erst laden, wenn sie gleich dran sind; einmal geladen bleiben sie stehen
  const reached = useRef(0);
  reached.current = Math.max(reached.current, active);
  const empty = area.categories.length === 0;

  const label = (
    <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-8">
      <h2
        className={`font-display font-normal text-5xl sm:text-6xl leading-none tracking-wide ${
          empty ? 'text-white/35' : 'text-white'
        }`}
      >
        {area.name}
      </h2>
      {empty ? (
        <span className="mt-4 inline-block rounded-full border border-white/15 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-white/45">
          Bald verfügbar
        </span>
      ) : (
        <div className="mt-3 flex items-end justify-between gap-4">
          <p className="text-sm text-white/65">{area.categories.map((c) => c.title).join(' · ')}</p>
          <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand transition-all duration-300 group-hover:gap-2.5">
            Ansehen
            <ArrowRight size={16} />
          </span>
        </div>
      )}
    </div>
  );

  const shell = 'relative block w-full overflow-hidden rounded-xl text-left aspect-[4/3] lg:aspect-[3/4]';

  if (empty) {
    return (
      <div className={`${shell} glass-card`} aria-disabled="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.04),transparent_60%)]" />
        {label}
      </div>
    );
  }

  return (
    <button type="button" onClick={onOpen} className={`group ${shell} glass-card glass-card-interactive`}>
      <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.03]">
        {area.previews.map((src, i) =>
          i <= reached.current + 1 ? (
            <img
              key={src}
              src={optimizedSrc(src, 900)}
              srcSet={optimizedSrcSet(src, [480, 900, 1400])}
              sizes="(min-width: 1024px) 33vw, 100vw"
              alt=""
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1600ms] ease-in-out ${
                i === active ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ) : null,
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/0" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand/30 via-brand/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      {label}
    </button>
  );
}

// Kleine Leiste innerhalb eines Bereichs: zurück zur Übersicht oder direkt
// in einen anderen Bereich, ohne über die großen Karten zu gehen.
function AreaBar({
  areas,
  active,
  onChange,
  onOverview,
}: {
  areas: GalleryAreaCard[];
  active: string;
  onChange: (slug: string) => void;
  onOverview: () => void;
}) {
  return (
    <div className="flex justify-center">
      <div
        className="inline-flex max-w-full items-center gap-0.5 sm:gap-1 overflow-x-auto [scrollbar-width:none] rounded-full border border-white/10 bg-black/60 p-1"
        role="group"
        aria-label="Bereich"
      >
        <button
          type="button"
          onClick={onOverview}
          aria-label="Übersicht"
          className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 sm:px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LayoutGrid size={15} />
          <span className="hidden sm:inline">Übersicht</span>
        </button>
        <span className="mx-0.5 sm:mx-1 h-5 w-px shrink-0 bg-white/10" aria-hidden="true" />
        {areas.map((a) => {
          const on = a.slug === active;
          const empty = a.categories.length === 0;
          return (
            <button
              key={a.slug}
              type="button"
              disabled={empty}
              aria-pressed={on}
              title={empty ? 'Bald verfügbar' : undefined}
              onClick={() => onChange(a.slug)}
              className={`shrink-0 rounded-full px-3 sm:px-5 py-2 text-[13px] sm:text-sm font-semibold transition-colors ${
                on
                  ? 'bg-brand text-black'
                  : empty
                    ? 'cursor-default text-white/25'
                    : 'text-white/70 hover:bg-brand/15 hover:text-white'
              }`}
            >
              {a.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Auswahl steht in der Adresse (?bereich=…&kategorie=…): Zurück-Taste führt
// zur Übersicht, und Links auf einen Bereich funktionieren direkt.
export default function Gallery() {
  const [params, setParams] = useSearchParams();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const area = galleryAreaCards.find((a) => a.slug === params.get('bereich') && a.categories.length > 0) ?? null;
  const categoryParam = params.get('kategorie');
  const categoryId = area?.categories.some((c) => c.id === categoryParam) ? categoryParam! : ALL;

  const shownCategories: GalleryCategory[] = area
    ? area.categories.filter((c) => categoryId === ALL || c.id === categoryId)
    : [];
  // Lightbox blättert durch alles, was gerade angezeigt wird
  const galleryItems: GalleryItem[] = shownCategories.flatMap((c) => c.items);

  const areaSlugParam = area?.slug;
  useEffect(() => setSelectedIndex(null), [areaSlugParam, categoryId]);

  // Beim Öffnen eines Bereichs nach oben zur Leiste, falls man weiter unten war
  useEffect(() => {
    if (!areaSlugParam) return;
    const el = barRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - getNavHeight() - 24;
    if (window.scrollY > top + 8) window.scrollTo({ top, behavior: 'smooth' });
  }, [areaSlugParam]);

  const chooseArea = (slug: string) => setParams({ bereich: slug }, { preventScrollReset: true });
  const showOverview = () => setParams({}, { preventScrollReset: true });
  const chooseCategory = (id: string) =>
    setParams(id === ALL ? { bereich: area!.slug } : { bereich: area!.slug, kategorie: id }, {
      replace: true,
      preventScrollReset: true,
    });

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

        {!area ? (
          <BlurFade delay={0.5} inView sessionKey="gallery-areas">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
              {galleryAreaCards.map((a, i) => (
                <AreaCard key={a.slug} area={a} index={i} onOpen={() => chooseArea(a.slug)} />
              ))}
            </div>
          </BlurFade>
        ) : (
          <>
            <div ref={barRef} className="space-y-4 mb-10 sm:mb-14">
              <AreaBar areas={galleryAreaCards} active={area.slug} onChange={chooseArea} onOverview={showOverview} />
              {area.categories.length > 1 && (
                <FilterBar
                  label="Kategorie"
                  size="sm"
                  active={categoryId}
                  onChange={chooseCategory}
                  options={[{ id: ALL, label: 'Alle' }, ...area.categories.map((c) => ({ id: c.id, label: c.title }))]}
                />
              )}
            </div>

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
          </>
        )}
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
