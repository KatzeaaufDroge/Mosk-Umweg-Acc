// Galerie-Inhalte liegen als JSON unter /content/galerie und werden über das
// Admin-Panel (/admin, Decap CMS) gepflegt. Jede Änderung dort ist ein Commit,
// der den normalen Netlify-Deploy auslöst.

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
  sichtbar: boolean;
  layout?: string;
  bilder?: { bild: string; beschreibung?: string; groesse?: string }[];
}

export interface GalleryItem {
  src: string;
  alt: string;
  category: string;
  size: GallerySize;
}

export interface GalleryCategory {
  id: string;
  bereich: 'Fotografie';
  title: string;
  visible: boolean;
  layout: GalleryLayout;
  items: GalleryItem[];
}

// Eine im Admin gesetzte Größe gewinnt, sonst gilt die Vorgabe der Vorlage.
function effectiveSize(layout: GalleryLayout, index: number, chosen?: string): GallerySize {
  if (layout === 'mosaik') return 'normal';
  if (chosen && (SIZES as string[]).includes(chosen)) return chosen as GallerySize;
  return layout === 'highlight' && index === 0 ? 'gross' : 'normal';
}

// Reihenfolge der Kategorien auf der Seite. Neue Kategorien hier ergänzen
// und in public/admin/config.yml eintragen.
const CATEGORY_ORDER = ['foto-event', 'foto-moderation', 'foto-unternehmen', 'foto-werbung'];

const files = import.meta.glob<GalleryFile>('/content/galerie/*.json', {
  eager: true,
  import: 'default',
});

export const galleryCategories: GalleryCategory[] = CATEGORY_ORDER.flatMap((id) => {
  const file = files[`/content/galerie/${id}.json`];
  if (!file) return [];
  const layout: GalleryLayout = (LAYOUTS as string[]).includes(file.layout ?? '')
    ? (file.layout as GalleryLayout)
    : 'mosaik';
  return [
    {
      id,
      bereich: 'Fotografie' as const,
      title: file.title,
      visible: file.sichtbar,
      layout,
      items: (file.bilder ?? [])
        .filter((b) => b.bild)
        .map((b, i) => ({
          src: b.bild,
          alt: b.beschreibung || file.title,
          category: file.title,
          size: effectiveSize(layout, i, b.groesse),
        })),
    },
  ];
});

export const visibleGalleryCategories: GalleryCategory[] = galleryCategories.filter(
  (c) => c.visible && c.items.length > 0,
);

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
