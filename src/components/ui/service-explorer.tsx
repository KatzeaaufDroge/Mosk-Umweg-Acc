import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import type { IdealFor, Service } from '../../data/services';
import { ServiceCard } from './service-card';
import { useContactWithPrefill, type ContactPrefill } from '../../hooks/useScrollToContact';
import { getNavHeight } from '../../lib/utils';

interface ServiceExplorerProps {
  services: Service[];
  kundentyp: ContactPrefill['kundentyp'];
}

const OTHER: IdealFor = {
  title: 'Etwas anderes',
  text: 'Du hast etwas anderes im Kopf? Wähle das aus und beschreib dein Projekt kurz im Formular.',
};

// Anlass-Karte: erster Klick klappt auf (kurzer Text + "Auswählen"),
// "Auswählen" übernimmt die Wahl ins Kontaktformular.
function OccasionCard({
  item,
  open,
  index,
  dashed,
  onToggle,
  onChoose,
}: {
  item: IdealFor;
  open: boolean;
  index: number;
  dashed?: boolean;
  onToggle: () => void;
  onChoose: () => void;
}) {
  const panelId = `anlass-${index}`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.2 + index * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
      className={`rounded-xl border transition-colors duration-200 ${open ? 'border-brand/70 bg-[#171717]' : `${dashed ? 'border-dashed border-white/15' : 'border-white/10 bg-[#171717]'} hover:border-brand/60`}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="group w-full flex items-center justify-between gap-3 text-left px-5 py-4 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <span className={`font-semibold text-sm sm:text-base ${dashed && !open ? 'text-gray-300' : 'text-white'}`}>
          {item.title}
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-brand' : 'text-gray-500 group-hover:text-brand'}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ height: 0 }}
            animate={{ height: 'auto', transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } }}
            exit={{ height: 0, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.2, delay: 0.08 } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="px-5 pb-5 flex flex-col sm:flex-row sm:items-end gap-4"
            >
              <p className="flex-1 text-gray-300 text-sm sm:text-base leading-relaxed">{item.text}</p>
              <button
                type="button"
                onClick={onChoose}
                className="group self-start sm:self-auto shrink-0 inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-light text-black font-bold text-sm sm:text-base rounded-lg px-5 py-2.5 transition-colors"
              >
                Auswählen
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Karte anklicken -> sie wandert in die Mitte, die anderen verschwinden,
// die "Ideal für"-Punkte klappen als eigene Karten auf. Anlass anklicken
// zeigt einen kurzen Text, "Auswählen" springt zum Kontaktformular auf der
// Startseite, vorausgefüllt.
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
  const [openOccasion, setOpenOccasion] = useState<string | null>(null);

  // Beim Wechsel des Services ist wieder alles zugeklappt
  useEffect(() => setOpenOccasion(null), [selected?.id]);

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
                <div className="flex flex-col gap-3">
                  {[...selected.idealFor, OTHER].map((item, i) => {
                    const isOther = item === OTHER;
                    return (
                      <OccasionCard
                        key={item.title}
                        item={item}
                        index={i}
                        dashed={isOther}
                        open={openOccasion === item.title}
                        onToggle={() => setOpenOccasion(openOccasion === item.title ? null : item.title)}
                        onChoose={() => requestService(selected, isOther ? undefined : item.title)}
                      />
                    );
                  })}
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
