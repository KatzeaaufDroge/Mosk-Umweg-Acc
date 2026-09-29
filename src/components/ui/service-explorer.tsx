import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Service } from '../../data/services';
import { ServiceCard } from './service-card';
import { useContactWithPrefill, type ContactPrefill } from '../../hooks/useScrollToContact';
import { getNavHeight } from '../../lib/utils';

interface ServiceExplorerProps {
  services: Service[];
  kundentyp: ContactPrefill['kundentyp'];
}

// Karte anklicken -> sie wandert in die Mitte, die anderen verschwinden,
// die "Ideal für"-Punkte klappen als eigene Karten auf. Eine davon anklicken
// springt zum Kontaktformular auf der Startseite, vorausgefüllt.
// Die Auswahl steht in der Adresse (?service=…): Zurück-Taste klappt zu,
// und vom Kontaktformular zurück landet man wieder in der offenen Auswahl.
export function ServiceExplorer({ services, kundentyp }: ServiceExplorerProps) {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const goToContact = useContactWithPrefill();

  const selected = services.find((s) => s.id === params.get('service')) ?? null;
  const visible = selected ? [selected] : services;

  useEffect(() => {
    if (!selected) return;
    const el = containerRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - getNavHeight() - 24;
    if (Math.abs(window.scrollY - top) > 8) window.scrollTo({ top, behavior: 'smooth' });
  }, [selected]);

  const open = (id: string) => {
    setParams({ service: id }, { state: { serviceOpened: true }, preventScrollReset: true });
  };

  const close = () => {
    // Wurde die Auswahl hier geöffnet, einfach einen Schritt zurück (wie Zurück-Taste)
    if ((location.state as { serviceOpened?: boolean } | null)?.serviceOpened) navigate(-1);
    else setParams({}, { replace: true, preventScrollReset: true });
  };

  const requestService = (service: Service, anlass?: string) => {
    const leistung = anlass ? `${service.title} – ${anlass}` : service.title;
    goToContact({
      kundentyp,
      leistung,
      message: `Anfrage: ${leistung}\n\nDatum / Zeitraum: \nOrt: \nWeitere Infos: `,
    });
  };

  return (
    <MotionConfig reducedMotion="user" transition={{ type: 'spring', stiffness: 260, damping: 32 }}>
      <LayoutGroup>
        <div ref={containerRef}>
          <motion.div
            layout
            className={
              selected ? 'max-w-2xl mx-auto' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10'
            }
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((service) => (
                <motion.button
                  key={service.id}
                  layout
                  type="button"
                  onClick={() => (selected ? close() : open(service.id))}
                  aria-expanded={selected?.id === service.id}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.2 } }}
                  className="block w-full text-left rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[#262626]"
                >
                  <ServiceCard
                    title={service.title}
                    description={service.description}
                    idealFor={service.idealFor}
                    image={service.image}
                    icon={service.icon}
                    expanded={selected?.id === service.id}
                  />
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>

          <AnimatePresence>
            {selected && (
              <motion.div
                key={`${selected.id}-options`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }}
                exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
                className="max-w-2xl mx-auto mt-8 sm:mt-10"
              >
                <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-5">Worum geht es genau?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {selected.idealFor.map((anlass, i) => (
                    <motion.button
                      key={anlass}
                      type="button"
                      onClick={() => requestService(selected, anlass)}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: 0.2 + i * 0.05 } }}
                      className="group flex items-center justify-between gap-3 text-left bg-[#171717] border border-white/10 hover:border-brand/70 rounded-xl px-5 py-4 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      <span className="text-white font-semibold text-sm sm:text-base">{anlass}</span>
                      <ArrowRight
                        size={18}
                        className="shrink-0 text-gray-500 group-hover:text-brand group-hover:translate-x-1 transition-all duration-200"
                      />
                    </motion.button>
                  ))}
                  <motion.button
                    type="button"
                    onClick={() => requestService(selected)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.2 + selected.idealFor.length * 0.05 } }}
                    className="group sm:col-span-2 flex items-center justify-between gap-3 text-left border border-dashed border-white/15 hover:border-brand/70 rounded-xl px-5 py-4 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <span className="text-gray-300 text-sm sm:text-base">Etwas anderes – ich beschreibe es selbst</span>
                    <ArrowRight
                      size={18}
                      className="shrink-0 text-gray-500 group-hover:text-brand group-hover:translate-x-1 transition-all duration-200"
                    />
                  </motion.button>
                </div>

                <button
                  type="button"
                  onClick={close}
                  className="mt-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={16} />
                  Alle Services anzeigen
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}
