import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InteractiveHoverButton } from './ui/interactive-hover-button';
import { BlurFade } from './ui/blur-fade';
import { useAnimation } from '../context/AnimationContext';
import heroImg1 from '../../assets/msk_bigg_6-bearbeitet.webp';
import heroImg2 from '../../assets/dslr_camera_lens_original_669131.webp';
import heroImg3 from '../../assets/Dashboard.webp';
import heroImg4 from '../../assets/Mond.webp';

const images = [
  { src: heroImg1, width: 1920, height: 1200 },
  { src: heroImg2, width: 1920, height: 1141 },
  { src: heroImg3, width: 1920, height: 1080 },
  { src: heroImg4, width: 1920, height: 1440 },
];

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
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A1F44] via-[#0d2a5c] to-[#0A1F44] pt-16 sm:pt-20 md:pt-0">
      {images.map((image, index) => (
        <div key={image.src} className={`absolute inset-0 transition-opacity duration-1000 ${currentImageIndex === index ? 'opacity-80' : 'opacity-0'}`}>
          <img
            src={image.src}
            width={image.width}
            height={image.height}
            alt="Hero"
            className="w-full h-full object-cover"
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A1F44]/80 via-[#0d2a5c]/50 to-[#0A1F44]/80 mix-blend-multiply" />
        </div>
      ))}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24 text-center">
        <BlurFade delay={0.25} inView={showInitialAnimation} sessionKey="hero-title">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-8xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight" style={{ fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, color: '#22c55e' }}>
            <div>FOTOS. VIDEOS. EDITING.</div>
          </h1>
        </BlurFade>

        <BlurFade delay={0.5} inView={showInitialAnimation} sessionKey="hero-subtitle">
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-gray-200 mb-6 sm:mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400 }}>
            Ihre Vision. Mein Handwerk. Ein Ergebnis, das überzeugt.
          </p>
        </BlurFade>

        <BlurFade delay={0.75} inView={showInitialAnimation} sessionKey="hero-button">
          <InteractiveHoverButton
            text="Starten"
            onClick={handleStartClick}
          />
        </BlurFade>
      </div>
    </section>
  );
}
