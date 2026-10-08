import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import HolographicBeams from './beams-background';

/*
  Passiver Hintergrund der Galerie: Lichtsäulen in Mosk-Grün (beams-background).
  Die Leinwand ist so hoch wie der Bildschirm und bleibt beim Scrollen stehen
  (sticky), ist aber auf den eigenen Bereich begrenzt -> überdeckt keinen Footer.
*/
export default function GalleryBackdrop({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('relative isolate bg-[#111211]', className)}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-clip">
        <div className="sticky top-0 h-screen w-full">
          <HolographicBeams density={18} speed={0.45} aberration={3} opacity={85} />
        </div>
      </div>
      {children}
    </div>
  );
}
