import { Seo } from '../components/Seo';
import { ueberMich } from '../data/seiten';
import { optimizedSrc, optimizedSrcSet } from '../lib/images';

// Dima baut die Seite selbst im Admin (Seiten -> Über mich) aus Bausteinen:
// Überschrift, Text, Bild – in beliebiger Reihenfolge. Solange keine Bausteine
// da sind, steht wie bisher nur das "Unter Konstruktion"-Bild.
export default function AboutPage() {
  const bausteine = (ueberMich.inhalt ?? []).filter((b) =>
    b.type === 'bild' ? b.bild : b.text?.trim(),
  );

  if (bausteine.length === 0) {
    return (
      <div className="pt-32 bg-black min-h-screen flex items-center justify-center px-4">
        <Seo
          title="Über mich – Mosk Unlimited"
          description="Erfahren Sie mehr über Mosk Unlimited aus Ostbelgien – Amel."
          path="/about"
        />
        <div className="w-full max-w-3xl">
          <img
            src={ueberMich.platzhalter}
            alt="Unter Konstruktion"
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 sm:pt-32 pb-16 sm:pb-24 bg-black min-h-screen px-4">
      <Seo
        title="Über mich – Mosk Unlimited"
        description="Erfahren Sie mehr über Mosk Unlimited aus Ostbelgien – Amel."
        path="/about"
      />
      <div className="w-full max-w-3xl mx-auto space-y-6 sm:space-y-8">
        {bausteine.map((b, i) => {
          if (b.type === 'ueberschrift') {
            const Tag = i === 0 ? 'h1' : 'h2';
            return (
              <Tag
                key={i}
                className={`font-display font-normal leading-tight ${
                  i === 0 ? 'text-5xl sm:text-6xl md:text-7xl text-brand' : 'text-3xl sm:text-4xl md:text-5xl text-white pt-4'
                }`}
              >
                {b.text}
              </Tag>
            );
          }
          if (b.type === 'bild') {
            return (
              <figure key={i}>
                <img
                  src={optimizedSrc(b.bild!, 1400)}
                  srcSet={optimizedSrcSet(b.bild!, [480, 900, 1400])}
                  sizes="(min-width: 768px) 768px, 100vw"
                  alt={b.beschreibung || 'Über mich'}
                  loading={i < 2 ? 'eager' : 'lazy'}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
                {b.beschreibung && (
                  <figcaption className="mt-2 text-sm text-white/50">{b.beschreibung}</figcaption>
                )}
              </figure>
            );
          }
          return (
            <div key={i} className="space-y-4 text-base sm:text-lg leading-relaxed text-gray-300">
              {b.text!
                .split(/\n\s*\n/)
                .filter((a) => a.trim())
                .map((absatz, j) => (
                  <p key={j} className="whitespace-pre-line">
                    {absatz.trim()}
                  </p>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
