interface ServiceCardProps {
  title: string;
  description: string;
  image: string;
  icon?: string;
}

export function ServiceCard({ title, description, image, icon }: ServiceCardProps) {
  return (
    <div className="group rounded-xl overflow-hidden bg-[#171717] hover:shadow-2xl hover:shadow-brand/10 transition-all duration-300 h-full flex flex-col">
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
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed flex-1 whitespace-pre-wrap">
          {description}
        </p>
      </div>
    </div>
  );
}
