import { ArrowRight } from 'lucide-react';
import Gallery from '../components/Gallery';
import { useScrollToContact } from '../hooks/useScrollToContact';
import { Seo } from '../components/Seo';

export default function PortfolioPage() {
  const scrollToContact = useScrollToContact();

  return (
    <div>
      <Seo
        title="Galerie – Mosk Unlimited"
        description="Ein Einblick in die besten Arbeiten von Mosk Unlimited: Event-Fotografie und mehr aus St. Vith, Belgien."
        path="/portfolio"
      />
      <Gallery />
      <section className="relative py-16 sm:py-24 overflow-hidden" style={{ backgroundColor: '#262626' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-black p-6 sm:p-8 lg:p-12 rounded-xl text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 lg:mb-4">
              Starten wir Ihr Projekt!
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 mb-4 sm:mb-6 lg:mb-8 max-w-2xl mx-auto">
              Kontaktieren Sie mich für ein unverbindliches Erstgespräch und lassen Sie uns gemeinsam Ihre Vision verwirklichen.
            </p>
            <button
              onClick={scrollToContact}
              className="group inline-flex items-center gap-2 sm:gap-3 bg-[#F5B700] text-[#0A1F44] px-5 sm:px-8 py-2 sm:py-4 rounded-lg font-bold text-sm sm:text-base lg:text-lg hover:bg-[#ffc61a] transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              Jetzt Beratung anfragen
              <ArrowRight className="group-hover:translate-x-1 transition-transform duration-300" size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
