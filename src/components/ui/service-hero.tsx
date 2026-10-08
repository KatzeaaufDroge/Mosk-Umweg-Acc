import { ReactNode } from 'react';

interface ServiceHeroProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function ServiceHero({ title, subtitle, children }: ServiceHeroProps) {
  return (
    <div className="text-center mb-12 sm:mb-16 lg:mb-20">
      <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-normal text-brand leading-none mb-4 sm:mb-6">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-3xl mx-auto">
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}
