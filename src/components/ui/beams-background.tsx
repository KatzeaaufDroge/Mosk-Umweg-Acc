import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/*
  Lichtsäulen-Hintergrund (basiert auf "Holographic Beams"), angepasst für Mosk:
  - Farben: statt Rot/Blau/Cyan Logo-Grün, dunkles Grün und warmes Weiß,
    Hintergrund #111211 statt reinem Schwarz
  - Scanlines neutral (ohne RGB-Tönung), Vignette in der Grundfarbe
  - Canvas Retina-scharf, prefers-reduced-motion -> stehendes Bild,
    pausiert, wenn der Tab im Hintergrund ist (requestAnimationFrame)
*/

interface HolographicBeamsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Anzahl der Lichtsäulen. Default: 30 */
  density?: number;
  /** Geschwindigkeit der Animation. Default: 1 */
  speed?: number;
  /** Seitlicher Versatz der Farbkanäle in px. Default: 2.5 */
  aberration?: number;
  /** Helligkeit in Prozent. Default: 50 */
  opacity?: number;
}

const BASE = '#111211';
// Linker Kanal, rechter Kanal, Kern (r, g, b)
const LEFT = '85, 160, 65'; // Logo-Grün #55A041
const RIGHT = '46, 92, 36'; // dunkles Grün
const CORE = '236, 246, 228'; // warmes, leicht grünliches Weiß

const HolographicBeams = ({
  className,
  density = 30,
  speed = 1,
  aberration = 2.5,
  opacity = 50,
  style,
  ...props
}: HolographicBeamsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = container.offsetWidth;
    let height = container.offsetHeight;
    let time = 0;
    let animationFrameId = 0;

    // Weiches, organisches Rauschen aus überlagerten Sinuswellen
    const noise = (x: number, t: number) =>
      (Math.sin(x * 0.01 + t) + Math.sin(x * 0.03 + t * 2) * 0.5 + Math.sin(x * 0.1 + t * 4) * 0.25) / 1.75;

    const resize = () => {
      width = container.offsetWidth;
      height = container.offsetHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduceMotion) drawFrame();
    };

    // Säule von unten nach oben, oben ausblendend wie ein Scheinwerfer
    const drawBeam = (x: number, t: number, color: string, widthMod: number) => {
      const n = noise(x, t * 0.5);
      const beamHeight = height * (0.6 + n * 0.4);
      const beamWidth = (width / density) * widthMod;

      const gradient = ctx.createLinearGradient(x, height, x, height - beamHeight);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(x - beamWidth / 2, height);
      ctx.lineTo(x + beamWidth / 2, height);
      ctx.lineTo(x + beamWidth, height - beamHeight);
      ctx.lineTo(x - beamWidth, height - beamHeight);
      ctx.fill();
    };

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'screen';

      const step = width / density;
      const o = opacity / 100;

      for (let i = 0; i <= density; i++) {
        const x = i * step;

        const lAlpha = o * (0.5 + 0.5 * Math.cos(i * 0.5 + time));
        drawBeam(x - aberration, time + i * 0.1, `rgba(${LEFT}, ${lAlpha * 0.5})`, 1.5);

        const rAlpha = o * (0.5 + 0.5 * Math.sin(i * 0.6 + time * 1.1));
        drawBeam(x + aberration, time + i * 0.12 + 10, `rgba(${RIGHT}, ${rAlpha * 0.5})`, 1.5);

        const coreAlpha = o * (0.6 + 0.4 * Math.sin(i * 0.3 - time));
        drawBeam(x, time + i * 0.1 + 5, `rgba(${CORE}, ${coreAlpha * 0.22})`, 0.8);
      }
    };

    const loop = () => {
      time += 0.01 * speed;
      drawFrame();
      animationFrameId = requestAnimationFrame(loop);
    };

    window.addEventListener('resize', resize);
    resize();
    if (reduceMotion) drawFrame();
    else loop();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [density, speed, aberration, opacity]);

  return (
    <div
      ref={containerRef}
      className={cn('absolute inset-0 z-0 overflow-hidden', className)}
      style={{ backgroundColor: BASE, ...style }}
      {...props}
    >
      <canvas ref={canvasRef} className="block h-full w-full blur-[4px]" />

      {/* Feine Scanlines als Textur */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.12]"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0) 50%, rgba(0,0,0,1) 50%)',
          backgroundSize: '100% 4px',
        }}
      />

      {/* Vignette in der Grundfarbe, hält die Mitte ruhig für Inhalte */}
      <div
        className="absolute inset-0 z-20"
        style={{ background: `radial-gradient(ellipse 75% 70% at 50% 45%, transparent 35%, ${BASE} 100%)` }}
      />
    </div>
  );
};

export default HolographicBeams;
