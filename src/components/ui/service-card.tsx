import { ArrowRight } from 'lucide-react';
import type { IdealFor } from '../../data/services';

interface ServiceCardProps {
  title: string;
  description: string;
  idealFor: IdealFor[];
  image: string;
  icon?: string;
  // Aufgeklappt: die "Ideal für"-Punkte stehen dann als eigene Karten darunter
  expanded?: boolean;
}

export function ServiceCard({ title, description, idealFor, image, icon, expanded = false }: ServiceCardProps) {
  return (
    <div className="group rounded-xl overflow-hidden bg-[#171717] hover:shadow-2xl hover:shadow-brand/10 transition-shadow duration-300 h-full flex flex-col">
      <div className="aspect-video overflow-hidden bg-gray-900">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="p-6 sm:p-8 space-y-4 flex flex-col flex-1">
        <h3 className="text-xl sm:text-2xl font-bold text-white min-h-[3.5rem] flex items-center gap-3">
          {icon && <img src={icon} alt="" className="w-10 h-10 object-cover" />}
          {title}
        </h3>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{description}</p>
        {!expanded && (
          <>
            <div className="text-gray-300 text-sm sm:text-base leading-relaxed flex-1">
              <p className="mb-1">Ideal für:</p>
              <ul>
                {idealFor.map((item) => (
                  <li key={item.title}>• {item.title}</li>
                ))}
              </ul>
            </div>
            <span className="inline-flex items-center gap-2 pt-2 text-brand font-semibold text-sm sm:text-base group-hover:gap-3 transition-all duration-300">
              Auswählen
              <ArrowRight size={18} />
            </span>
          </>
        )}
      </div>
    </div>
  );
}
