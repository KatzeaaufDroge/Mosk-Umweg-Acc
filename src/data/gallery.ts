// Galerie-Inhalte liegen als JSON unter /content/galerie und werden über das
// Admin-Panel (/admin, Decap CMS) gepflegt. Jede Änderung dort ist ein Commit,
// der den normalen Netlify-Deploy auslöst.

interface GalleryFile {
  title: string;
  sichtbar: boolean;
  bilder?: { bild: string; beschreibung?: string }[];
}

export interface GalleryItem {
  src: string;
  alt: string;
  category: string;
}

export interface GalleryCategory {
  id: string;
  bereich: 'Fotografie';
  title: string;
  visible: boolean;
  items: GalleryItem[];
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
  return [
    {
      id,
      bereich: 'Fotografie' as const,
      title: file.title,
      visible: file.sichtbar,
      items: (file.bilder ?? [])
        .filter((b) => b.bild)
        .map((b) => ({ src: b.bild, alt: b.beschreibung || file.title, category: file.title })),
    },
  ];
});

export const visibleGalleryItems: GalleryItem[] = galleryCategories
  .filter((c) => c.visible)
  .flatMap((c) => c.items);

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
