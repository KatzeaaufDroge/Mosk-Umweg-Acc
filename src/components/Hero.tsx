import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InteractiveHoverButton } from './ui/interactive-hover-button';
import { BlurFade } from './ui/blur-fade';
import { useAnimation } from '../context/AnimationContext';
import { startseite } from '../data/seiten';
import { optimizedSrc, optimizedSrcSet } from '../lib/images';

// Hintergrundbilder kommen aus dem Admin (Seiten -> Startseite)
const images = startseite.bilder.map((b) => b.bild).filter(Boolean);

export default function Hero() {
  const navigate = useNavigate();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { showInitialAnimation } = useAnimation();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleStartClick = () => {
    navigate('/services');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-black pt-16 sm:pt-20 md:pt-0">
      {images.map((image, index) => (
        <div key={`${index}-${image}`} className={`absolute inset-0 transition-opacity duration-1000 ${currentImageIndex === index ? 'opacity-80' : 'opacity-0'}`}>
          <img
            src={optimizedSrc(image, 2000)}
            srcSet={optimizedSrcSet(image, [900, 1400, 2000])}
            sizes="100vw"
            alt="Hero"
            className="w-full h-full object-cover"
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/45 to-black/80" />
        </div>
      ))}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24 text-center">
        <BlurFade delay={0.25} inView={showInitialAnimation} sessionKey="hero-title">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-8xl font-display font-normal mb-3 sm:mb-4 md:mb-6 leading-tight" style={{ color: '#55a041' }}>
            <div>{startseite.titel}</div>
          </h1>
        </BlurFade>

        <BlurFade delay={0.5} inView={showInitialAnimation} sessionKey="hero-subtitle">
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-display font-normal text-gray-200 mb-6 sm:mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed">
            {startseite.untertitel}
          </p>
        </BlurFade>

        <BlurFade delay={0.75} inView={showInitialAnimation} sessionKey="hero-button">
          <InteractiveHoverButton
            text={startseite.button}
            onClick={handleStartClick}
          />
        </BlurFade>
      </div>
    </section>
  );
}
