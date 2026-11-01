import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, ArrowRight } from 'lucide-react';
import { ServiceHero } from '../components/ui/service-hero';
import { BlurFade } from '../components/ui/blur-fade';
import { useAnimation } from '../context/AnimationContext';
import { useScrollToContact } from '../hooks/useScrollToContact';
import { Seo } from '../components/Seo';
import KineticGrid from '../components/ui/kinetic-grid';
import { servicesUebersicht as seite } from '../data/seiten';

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
    <KineticGrid className="min-h-screen">
    <div className="pt-28 sm:pt-32 pb-16 sm:pb-24">
      <Seo
        title="Services – Event & Business – Mosk Unlimited"
        description="Fotografie, Videografie und Editing – wählen Sie den passenden Service-Bereich für Privatkunden oder Unternehmen."
        path="/services"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BlurFade delay={0.25} inView={showInitialAnimation} sessionKey="services-hero">
          <ServiceHero
            title={seite.titel}
            subtitle={seite.untertitel}
          />
        </BlurFade>

        <BlurFade delay={0.5} inView={showInitialAnimation} sessionKey="services-choice">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 max-w-5xl mx-auto">
            <button
              onClick={handlePrivateCustomers}
              className="group relative glass-card glass-card-interactive rounded-xl overflow-hidden hover:scale-[1.03] p-8 sm:p-12 text-left"
            >
              <div className="relative z-10">
                <div className="bg-brand w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Users className="text-black" size={32} />
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 group-hover:text-brand transition-colors duration-300">
                  {seite.privat.titel}
                </h2>
                <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8">
                  {seite.privat.text}
                </p>
                <div className="inline-flex items-center gap-2 text-brand font-semibold text-sm sm:text-base group-hover:gap-3 transition-all duration-300">
                  {seite.link_text}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-brand/0 to-brand/0 group-hover:from-brand/5 group-hover:to-brand/10 transition-all duration-300" />
            </button>

            <button
              onClick={handleBusinessCustomers}
              className="group relative glass-card glass-card-interactive rounded-xl overflow-hidden hover:scale-[1.03] p-8 sm:p-12 text-left"
            >
              <div className="relative z-10">
                <div className="bg-brand w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="text-black" size={32} />
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 group-hover:text-brand transition-colors duration-300">
                  {seite.business.titel}
                </h2>
                <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8">
                  {seite.business.text}
                </p>
                <div className="inline-flex items-center gap-2 text-brand font-semibold text-sm sm:text-base group-hover:gap-3 transition-all duration-300">
                  {seite.link_text}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-brand/0 to-brand/0 group-hover:from-brand/5 group-hover:to-brand/10 transition-all duration-300" />
            </button>
          </div>
        </BlurFade>

        <BlurFade delay={0.75} inView={showInitialAnimation} sessionKey="services-info">
          <div className="glass-card p-6 sm:p-8 lg:p-12 rounded-xl text-center mt-12 sm:mt-16 lg:mt-20">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 lg:mb-4">
              {seite.hinweis.titel}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-4 sm:mb-6 lg:mb-8 max-w-2xl mx-auto">
              {seite.hinweis.text}
            </p>
            <button
              onClick={scrollToContact}
              className="group inline-flex items-center gap-2 sm:gap-3 bg-brand text-black px-5 sm:px-8 py-2 sm:py-4 rounded-lg font-bold text-sm sm:text-base lg:text-lg hover:bg-brand-light transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              {seite.hinweis.button}
              <ArrowRight className="group-hover:translate-x-1 transition-transform duration-300" size={18} />
            </button>
          </div>
        </BlurFade>
      </div>
    </div>
    </KineticGrid>
  );
}
