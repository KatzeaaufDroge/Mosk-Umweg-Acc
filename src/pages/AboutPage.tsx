import { ArrowRight } from 'lucide-react';
import { Seo } from '../components/Seo';
import { BlurFade } from '../components/ui/blur-fade';
import { useAnimation } from '../context/AnimationContext';
import { useScrollToContact } from '../hooks/useScrollToContact';
import { ueberMich as seite } from '../data/seiten';
import { optimizedSrc, optimizedSrcSet } from '../lib/images';

// Aufbau fest, Inhalte aus dem Admin (Seiten -> Über mich).
// Werte-Raster passt sich der Anzahl an, damit keine Karte allein in einer Zeile steht.
const WERTE_SPALTEN: Record<number, string> = {
  1: 'lg:grid-cols-1 max-w-xl mx-auto',
  2: 'lg:grid-cols-2',
  4: 'lg:grid-cols-2',
};

export default function AboutPage() {
  const { showInitialAnimation } = useAnimation();
  const scrollToContact = useScrollToContact();
  const absaetze = (seite.geschichte.text ?? '').split(/\n\s*\n/).filter((a) => a.trim());
  const werte = (seite.werte.punkte ?? []).filter((p) => p.titel);
  const bilder = (seite.bilder ?? []).filter((b) => b.bild);

  return (
    <div className="min-h-screen bg-black pt-28 sm:pt-32 pb-16 sm:pb-24">
      <Seo
        title="Über mich – Mosk Unlimited"
        description="Erfahren Sie mehr über Mosk Unlimited aus Ostbelgien – Amel."
        path="/about"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Einstieg: Text links, Portrait rechts (am Handy Portrait oben) */}
        <section className={`grid grid-cols-1 gap-10 lg:gap-16 items-center ${seite.portrait ? 'lg:grid-cols-[1.1fr_1fr]' : ''}`}>
          <BlurFade delay={0.25} inView={showInitialAnimation} sessionKey="about-intro" className="order-2 lg:order-1">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-normal text-brand leading-none">
              {seite.titel}
            </h1>
            <p className="mt-6 sm:mt-8 text-2xl sm:text-3xl font-semibold text-white">{seite.name}</p>
            {seite.rolle && (
              <p className="mt-2 text-xs sm:text-sm uppercase tracking-[0.2em] text-white/50">{seite.rolle}</p>
            )}
            <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-gray-300 whitespace-pre-line">
              {seite.einleitung}
            </p>
            <button
              onClick={scrollToContact}
              className="group mt-8 inline-flex items-center gap-2 sm:gap-3 bg-brand text-black px-5 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-sm sm:text-base hover:bg-brand-light transition-all duration-300"
            >
              {seite.abschluss.button}
              <ArrowRight className="group-hover:translate-x-1 transition-transform duration-300" size={18} />
            </button>
          </BlurFade>

          {seite.portrait && (
            <BlurFade delay={0.4} inView={showInitialAnimation} sessionKey="about-portrait" className="order-1 lg:order-2">
              <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                <div aria-hidden="true" className="hidden sm:block absolute -inset-4 rounded-2xl border border-brand/30 translate-x-2 translate-y-2" />
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-900 ring-1 ring-white/10">
                  <img
                    src={optimizedSrc(seite.portrait, 1400)}
                    srcSet={optimizedSrcSet(seite.portrait, [480, 900, 1400])}
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    alt={seite.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </BlurFade>
          )}
        </section>

        {/* Geschichte */}
        {absaetze.length > 0 && (
          <BlurFade inView sessionKey="about-story">
            <section className="mt-20 sm:mt-28 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 lg:gap-16 border-t border-white/10 pt-12 sm:pt-16">
              <h2 className="font-display font-normal text-4xl sm:text-5xl text-white leading-tight">{seite.geschichte.titel}</h2>
              <div className="space-y-5 text-base sm:text-lg leading-relaxed text-gray-300">
                {absaetze.map((absatz, i) => (
                  <p key={i} className="whitespace-pre-line">
                    {absatz.trim()}
                  </p>
                ))}
              </div>
            </section>
          </BlurFade>
        )}

        {/* Werte */}
        {werte.length > 0 && (
          <section className="mt-20 sm:mt-28">
            <BlurFade inView sessionKey="about-values-title">
              <h2 className="mb-8 sm:mb-12 text-center font-display font-normal text-4xl sm:text-5xl text-white">
                {seite.werte.titel}
              </h2>
            </BlurFade>
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${WERTE_SPALTEN[werte.length] ?? 'lg:grid-cols-3'}`}>
              {werte.map((wert, i) => (
                <BlurFade key={i} inView delay={i * 0.08} sessionKey={`about-value-${i}`}>
                  <div className="glass-card h-full rounded-xl p-6 sm:p-8">
                    <span className="font-display text-3xl text-brand">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="mt-3 text-xl sm:text-2xl font-bold text-white">{wert.titel}</h3>
                    <p className="mt-3 text-sm sm:text-base leading-relaxed text-gray-300">{wert.text}</p>
                  </div>
                </BlurFade>
              ))}
            </div>
          </section>
        )}

        {/* Bilder */}
        {bilder.length > 0 && (
          <BlurFade inView sessionKey="about-images">
            <section className={`mt-20 sm:mt-28 grid grid-cols-1 gap-4 ${bilder.length > 1 ? 'sm:grid-cols-2 lg:grid-cols-3' : ''}`}>
              {bilder.map((b, i) => (
                <div key={i} className="group aspect-[4/5] overflow-hidden rounded-xl bg-neutral-900">
                  <img
                    src={optimizedSrc(b.bild, 900)}
                    srcSet={optimizedSrcSet(b.bild, [480, 900, 1400])}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    alt={b.beschreibung || seite.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
              ))}
            </section>
          </BlurFade>
        )}

        {/* Abschluss */}
        <BlurFade inView sessionKey="about-cta">
          <div className="glass-card mt-20 sm:mt-28 rounded-xl p-6 sm:p-8 lg:p-12 text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 lg:mb-4">
              {seite.abschluss.titel}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-4 sm:mb-6 lg:mb-8 max-w-2xl mx-auto">
              {seite.abschluss.text}
            </p>
            <button
              onClick={scrollToContact}
              className="group inline-flex items-center gap-2 sm:gap-3 bg-brand text-black px-5 sm:px-8 py-2 sm:py-4 rounded-lg font-bold text-sm sm:text-base lg:text-lg hover:bg-brand-light transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              {seite.abschluss.button}
              <ArrowRight className="group-hover:translate-x-1 transition-transform duration-300" size={18} />
            </button>
          </div>
        </BlurFade>
      </div>
    </div>
  );
}
