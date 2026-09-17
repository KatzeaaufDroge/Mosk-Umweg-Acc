import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, ArrowRight } from 'lucide-react';
import { ServiceHero } from '../components/ui/service-hero';
import { BlurFade } from '../components/ui/blur-fade';
import { useAnimation } from '../context/AnimationContext';
import { useScrollToContact } from '../hooks/useScrollToContact';
import { Seo } from '../components/Seo';

export default function ServicesPage() {
  const navigate = useNavigate();
  const { showInitialAnimation } = useAnimation();
  const scrollToContact = useScrollToContact();

  const handlePrivateCustomers = () => {
    navigate('/services/event');
  };

  const handleBusinessCustomers = () => {
    navigate('/services/business');
  };

  return (
    <div className="min-h-screen bg-[#262626] pt-28 sm:pt-32 pb-16 sm:pb-24">
      <Seo
        title="Services – Event & Business – Mosk Unlimited"
        description="Fotografie, Videografie und Editing – wählen Sie den passenden Service-Bereich für Privatkunden oder Unternehmen."
        path="/services"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BlurFade delay={0.25} inView={showInitialAnimation} sessionKey="services-hero">
          <ServiceHero
            title="ALLES AUS EINER HAND."
            subtitle="Wählen Sie den passenden Service-Bereich für Ihre Bedürfnisse."
          />
        </BlurFade>

        <BlurFade delay={0.5} inView={showInitialAnimation} sessionKey="services-choice">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 max-w-5xl mx-auto">
            <button
              onClick={handlePrivateCustomers}
              className="group relative bg-[#171717] hover:bg-gradient-to-br hover:from-[#242424] hover:to-[#1c1c1c] rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-[#22c55e]/10 p-8 sm:p-12 text-left"
            >
              <div className="relative z-10">
                <div className="bg-[#22c55e] w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Users className="text-black" size={32} />
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 group-hover:text-[#22c55e] transition-colors duration-300">
                  Für Privatkunden
                </h2>
                <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8">
                  Event-Fotografie, Event-Videografie und professionelles Editing für Festivals, Konzerte, Hochzeiten und private Veranstaltungen.
                </p>
                <div className="inline-flex items-center gap-2 text-[#22c55e] font-semibold text-sm sm:text-base group-hover:gap-3 transition-all duration-300">
                  Services ansehen
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#22c55e]/0 to-[#22c55e]/0 group-hover:from-[#22c55e]/5 group-hover:to-[#22c55e]/10 transition-all duration-300" />
            </button>

            <button
              onClick={handleBusinessCustomers}
              className="group relative bg-[#171717] hover:bg-gradient-to-br hover:from-[#242424] hover:to-[#1c1c1c] rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-[#22c55e]/10 p-8 sm:p-12 text-left"
            >
              <div className="relative z-10">
                <div className="bg-[#22c55e] w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="text-black" size={32} />
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 group-hover:text-[#22c55e] transition-colors duration-300">
                  Für Unternehmen
                </h2>
                <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8">
                  Business-Fotografie, Imagefilme, Werbevideos und professionelle Nachbearbeitung für Ihr Unternehmen und Ihre Marke.
                </p>
                <div className="inline-flex items-center gap-2 text-[#22c55e] font-semibold text-sm sm:text-base group-hover:gap-3 transition-all duration-300">
                  Services ansehen
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#22c55e]/0 to-[#22c55e]/0 group-hover:from-[#22c55e]/5 group-hover:to-[#22c55e]/10 transition-all duration-300" />
            </button>
          </div>
        </BlurFade>

        <BlurFade delay={0.75} inView={showInitialAnimation} sessionKey="services-info">
          <div className="bg-black p-6 sm:p-8 lg:p-12 rounded-xl text-center mt-12 sm:mt-16 lg:mt-20">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 lg:mb-4">
              Nicht sicher, welcher Bereich zu Ihnen passt?
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-4 sm:mb-6 lg:mb-8 max-w-2xl mx-auto">
              Kontaktieren Sie mich für eine kostenlose Beratung. Gemeinsam finden wir die perfekte Lösung für Ihr Projekt.
            </p>
            <button
              onClick={scrollToContact}
              className="group inline-flex items-center gap-2 sm:gap-3 bg-[#F5B700] text-[#0A1F44] px-5 sm:px-8 py-2 sm:py-4 rounded-lg font-bold text-sm sm:text-base lg:text-lg hover:bg-[#ffc61a] transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              Jetzt Beratung anfragen
              <ArrowRight className="group-hover:translate-x-1 transition-transform duration-300" size={18} />
            </button>
          </div>
        </BlurFade>
      </div>
    </div>
  );
}
