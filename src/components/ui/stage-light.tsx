import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/*
  Passiver Hintergrund "Bühnenlicht" für die Galerie:
  - zwei weiche Lichtkegel von oben (Logo-Grün + warmes Weiß), die sehr
    langsam schwenken, dazu grüner Dunst, Filmkorn und Vignette
  - reines CSS (nur transform/opacity animiert), keine Interaktion
  - Licht bleibt beim Scrollen im Bild (sticky), ist aber auf den eigenen
    Bereich begrenzt -> überdeckt keinen Footer
  - prefers-reduced-motion -> stehendes Bild
  Styles: src/index.css (.stage-*)
*/
export default function StageLight({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('stage-light relative isolate', className)}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-clip">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <div className="stage-beam stage-beam--green">
            <div className="stage-beam__cone" />
          </div>
          <div className="stage-beam stage-beam--warm">
            <div className="stage-beam__cone" />
          </div>
          <div className="stage-haze" />
          <div className="stage-grain" />
          <div className="stage-vignette" />
        </div>
      </div>
      {children}
    </div>
  );
}
