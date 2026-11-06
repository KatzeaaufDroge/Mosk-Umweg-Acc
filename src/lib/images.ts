// Dima lädt Originale (Galerie und Seitenbilder, alles in /gallery) in voller
// Kameragröße hoch. Der Build erzeugt daraus WebP-Versionen in festen Breiten
// (vite.config.ts -> galleryImages, gleiche Liste). Lokal (vite dev) gibt es die nicht, dort wird das Original genutzt.
const GALLERY_WIDTHS = [480, 900, 1400, 2000];

function isGalleryImage(src: string) {
  return src.startsWith('/gallery/') && !src.startsWith('/gallery/_w/');
}

// Bildausschnitt aus dem Admin ("50% 12%"): welcher Teil sichtbar bleibt, wenn
// object-cover das Bild zuschneidet. Ohne Angabe bleibt es mittig.
export function fokusStyle(fokus?: string): { objectPosition: string } | undefined {
  return fokus && /^\d{1,3}(\.\d+)?% \d{1,3}(\.\d+)?%$/.test(fokus) ? { objectPosition: fokus } : undefined;
}

export function optimizedSrc(src: string, width: number): string {
  if (!import.meta.env.PROD || !isGalleryImage(src)) return src;
  const w = GALLERY_WIDTHS.find((x) => x >= width) ?? GALLERY_WIDTHS[GALLERY_WIDTHS.length - 1];
  return `/gallery/_w/${src.slice('/gallery/'.length)}-${w}.webp`;
}

export function optimizedSrcSet(src: string, widths: number[]): string | undefined {
  if (!import.meta.env.PROD || !isGalleryImage(src)) return undefined;
  return widths
    .filter((w) => GALLERY_WIDTHS.includes(w))
    .map((w) => `${optimizedSrc(src, w)} ${w}w`)
    .join(', ');
}
