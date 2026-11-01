import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { impressum } from '../data/seiten';

// E-Mail-Adressen im Text werden automatisch klickbar
function MitLinks({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\S+@\S+\.\w+)/).map((teil, i) =>
        i % 2 ? (
          <a key={i} href={`mailto:${teil}`} className="text-brand hover:text-brand-light">
            {teil}
          </a>
        ) : (
          teil
        ),
      )}
    </>
  );
}

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-neutral-950 pt-24 sm:pt-32 pb-12 sm:pb-16">
      <Seo
        title="Impressum – Mosk Unlimited"
        description="Impressum und rechtliche Angaben zu Mosk Unlimited, Ostbelgien – Amel."
        path="/impressum"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-normal text-white lg:text-7xl mb-8 sm:mb-12">Impressum</h1>

        <div className="prose prose-invert max-w-none space-y-6 sm:space-y-8">
          {impressum.abschnitte.map((abschnitt, index) => (
            <section key={index}>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-4">{abschnitt.titel}</h2>
              <div className="text-gray-300 space-y-1 sm:space-y-2 text-sm sm:text-base">
                {abschnitt.text.split('\n').map((zeile, i) => (
                  <p key={i}>
                    <MitLinks text={zeile} />
                  </p>
                ))}
              </div>
            </section>
          ))}

          <section className="pt-6 sm:pt-8 border-t border-gray-700">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4">Weitere Informationen</h2>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/agb"
                className="inline-flex items-center px-6 py-3 bg-brand text-black font-semibold rounded-lg hover:bg-brand-dark transition-all duration-300 text-sm sm:text-base"
              >
                AGB
              </Link>
              <Link
                to="/datenschutz"
                className="inline-flex items-center px-6 py-3 bg-brand text-black font-semibold rounded-lg hover:bg-brand-dark transition-all duration-300 text-sm sm:text-base"
              >
                Datenschutzerklärung
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
