// Galerie-Inhalte liegen als JSON unter /content/galerie und werden über das
// Admin-Panel (/admin, Decap CMS) gepflegt. Jede Änderung dort ist ein Commit,
// der den normalen Netlify-Deploy auslöst.
//
// Jede Datei = eine Kategorie. Bereich (Fotografie/Videografie/Editing) und
// Reihenfolge stehen in der Datei. Leere Kategorien blendet die Website
// automatisch aus – sobald Dima Inhalte hinzufügt, erscheinen sie.
// Neue Kategorie: JSON hier anlegen + in public/admin/config.yml eintragen.

// Layout-Vorlagen pro Kategorie (im Admin wählbar):
// - mosaik:    Bilder im natürlichen Format, versetzt (Masonry)
// - raster:    quadratisches Raster, einzelne Bilder können größer sein
// - highlight: wie raster, aber das erste Bild ist standardmäßig groß
// Die Regeln sind in public/admin/galerie-widget.js gespiegelt (Admin-Vorschau).
export type GalleryLayout = 'mosaik' | 'raster' | 'highlight';
export type GallerySize = 'normal' | 'breit' | 'hoch' | 'gross';

const LAYOUTS: GalleryLayout[] = ['mosaik', 'raster', 'highlight'];
const SIZES: GallerySize[] = ['normal', 'breit', 'hoch', 'gross'];

interface GalleryFile {
  title: string;
  bereich?: string;
  reihenfolge?: number;
  sichtbar?: boolean;
  layout?: string;
  bilder?: { bild: string; beschreibung?: string; groesse?: string; video?: string }[];
}

export interface GalleryItem {
  src: string;
  alt: string;
  category: string;
  size: GallerySize;
  // Einbettbare Video-URL (YouTube-nocookie / Vimeo), lädt erst nach Klick
  video?: string;
}

export interface GalleryCategory {
  id: string;
  bereich: string;
  title: string;
  layout: GalleryLayout;
  items: GalleryItem[];
}

export interface GalleryArea {
  name: string;
  categories: GalleryCategory[];
}

// Eine im Admin gesetzte Größe gewinnt, sonst gilt die Vorgabe der Vorlage.
function effectiveSize(layout: GalleryLayout, index: number, chosen?: string): GallerySize {
  if (layout === 'mosaik') return 'normal';
  if (chosen && (SIZES as string[]).includes(chosen)) return chosen as GallerySize;
  return layout === 'highlight' && index === 0 ? 'gross' : 'normal';
}

// YouTube/Vimeo-Link -> datensparsame Einbett-URL (null = kein gültiges Video)
export function embedUrl(link?: string): string | undefined {
  if (!link) return undefined;
  const url = link.trim();
  const yt = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1&dnt=1`;
  return undefined;
}

const files = import.meta.glob<GalleryFile>('/content/galerie/*.json', {
  eager: true,
  import: 'default',
});

const allCategories: (GalleryCategory & { order: number; hidden: boolean })[] = Object.entries(files)
  .map(([path, file]) => {
    const id = path.split('/').pop()!.replace(/\.json$/, '');
    const layout: GalleryLayout = (LAYOUTS as string[]).includes(file.layout ?? '')
      ? (file.layout as GalleryLayout)
      : 'mosaik';
    return {
      id,
      bereich: file.bereich || 'Fotografie',
      title: file.title,
      order: file.reihenfolge ?? 999,
      hidden: file.sichtbar === false,
      layout,
      items: (file.bilder ?? [])
        .filter((b) => b.bild)
        .map((b, i) => ({
          src: b.bild,
          alt: b.beschreibung || file.title,
          category: file.title,
          size: effectiveSize(layout, i, b.groesse),
          video: embedUrl(b.video),
        })),
    };
  })
  .sort((a, b) => a.order - b.order);

// Auf der Website erscheint eine Kategorie, sobald sie Inhalte hat
// (und nicht bewusst ausgeblendet wurde).
export const visibleGalleryCategories: GalleryCategory[] = allCategories.filter(
  (c) => !c.hidden && c.items.length > 0,
);

export const galleryAreas: GalleryArea[] = visibleGalleryCategories.reduce<GalleryArea[]>((areas, c) => {
  const area = areas.find((a) => a.name === c.bereich);
  if (area) area.categories.push(c);
  else areas.push({ name: c.bereich, categories: [c] });
  return areas;
}, []);

// Dima lädt Originale in voller Kameragröße hoch. Live liefert Netlifys
// Image CDN automatisch verkleinerte WebP/AVIF-Versionen aus; lokal (vite dev)
// gibt es den Dienst nicht, dort wird das Original genutzt.
export function optimizedSrc(src: string, width: number): string {
  if (!import.meta.env.PROD || !src.startsWith('/')) return src;
  return `/.netlify/images?url=${encodeURIComponent(src)}&w=${width}&q=78`;
}

export function optimizedSrcSet(src: string, widths: number[]): string | undefined {
  if (!import.meta.env.PROD || !src.startsWith('/')) return undefined;
  return widths.map((w) => `${optimizedSrc(src, w)} ${w}w`).join(', ');
}
