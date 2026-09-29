import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/*
  Interaktiver Hintergrund (basiert auf "Kinetic Grid"), angepasst für Mosk:
  - Farben: Logo-Grün #55a041, dezente Grundlinien, damit Inhalte vorne bleiben
  - Leinwand nur im eigenen Bereich (absolute statt fixed -> überdeckt keinen Footer)
  - Maus: Raster verzieht sich zum Cursor; Klick/Tippen: Welle
  - Ohne Maus (Handy) oder nach einer Pause: langsamer "Geister-Cursor"
  - Retina-scharf (devicePixelRatio), prefers-reduced-motion -> stehendes Bild
*/

interface Point {
  x: number;
  y: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  born: number;
}

const CELL_SIZE = 64;
const INFLUENCE_RADIUS = 240;
const MAX_WARP = 22;
const DOT_SPACING = 28;
const LERP_SPEED = 0.08;
const IDLE_AFTER_MS = 2500;

const BG = '#262626';
const LINE_BASE = { r: 255, g: 255, b: 255, a: 0.06 };
const NODE_BASE = { r: 255, g: 255, b: 255, a: 0.14 };
const BRAND = { r: 85, g: 160, b: 65 };
const LINE_ACTIVE = { ...BRAND, a: 0.85 };
const NODE_ACTIVE = { ...BRAND, a: 1 };
const GLOW = '85,160,65';
const RIPPLE = '97,181,74';
const NODE_BASE_RADIUS = 1.5;
const NODE_ACTIVE_RADIUS = 3.2;

function lerpN(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpColor(
  base: { r: number; g: number; b: number; a: number },
  active: { r: number; g: number; b: number; a: number },
  t: number,
) {
  const r = Math.round(lerpN(base.r, active.r, t));
  const g = Math.round(lerpN(base.g, active.g, t));
  const b = Math.round(lerpN(base.b, active.b, t));
  return `rgba(${r},${g},${b},${lerpN(base.a, active.a, t).toFixed(3)})`;
}

function warpedPoint(
  gx: number,
  gy: number,
  col: number,
  row: number,
  mouse: Point,
  ripples: Ripple[],
  cols: number,
  rows: number,
): { pt: Point; proximity: number } {
  // Ränder bleiben fest, damit das Raster nicht aus dem Bereich rutscht
  const edge = 1.5;
  const colPin = Math.min(col / edge, (cols - 1 - col) / edge, 1);
  const rowPin = Math.min(row / edge, (rows - 1 - row) / edge, 1);
  const pin = colPin * colPin * rowPin * rowPin;

  const dx = gx - mouse.x;
  const dy = gy - mouse.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const proximity = Math.max(0, 1 - dist / INFLUENCE_RADIUS) * pin;

  let rx = 0;
  let ry = 0;
  for (const r of ripples) {
    const rdx = gx - r.x;
    const rdy = gy - r.y;
    const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
    const waveWidth = 55;
    const diff = rdist - r.radius;
    if (Math.abs(diff) < waveWidth) {
      const strength = (1 - Math.abs(diff) / waveWidth) * r.opacity * 18 * pin;
      const angle = Math.atan2(rdy, rdx);
      const sign = diff < 0 ? 1 : -1;
      rx += Math.cos(angle) * strength * sign;
      ry += Math.sin(angle) * strength * sign;
    }
  }

  if (dist < INFLUENCE_RADIUS && dist > 0 && pin > 0) {
    const t = dist / INFLUENCE_RADIUS;
    const eased = t < 0.01 ? 0 : (1 - t) * (1 - t) * Math.min(1, dist / 60);
    const warp = eased * MAX_WARP * pin;
    const angle = Math.atan2(dy, dx);
    return {
      pt: { x: gx - Math.cos(angle) * warp + rx, y: gy - Math.sin(angle) * warp + ry },
      proximity,
    };
  }
  return { pt: { x: gx + rx, y: gy + ry }, proximity };
}

export default function KineticGrid({ children, className }: { children?: ReactNode; className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!wrap || !canvas || !ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mouse: Point = { x: -9999, y: -9999 };
    const target: Point = { x: -9999, y: -9999 };
    const ripples: Ripple[] = [];
    let lastPointer = 0;
    let w = 0;
    let h = 0;
    let raf = 0;
    let dots: HTMLCanvasElement | null = null;

    // Punkt-Textur einmal pro Größe vorzeichnen statt in jedem Frame
    const buildDots = (dpr: number) => {
      dots = document.createElement('canvas');
      dots.width = canvas.width;
      dots.height = canvas.height;
      const d = dots.getContext('2d');
      if (!d) return;
      d.scale(dpr, dpr);
      d.fillStyle = 'rgba(255,255,255,0.05)';
      for (let x = DOT_SPACING / 2; x < w; x += DOT_SPACING) {
        for (let y = DOT_SPACING / 2; y < h; y += DOT_SPACING) {
          d.beginPath();
          d.arc(x, y, 0.8, 0, Math.PI * 2);
          d.fill();
        }
      }
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildDots(dpr);
      if (reduceMotion) draw(performance.now());
    };

    const draw = (now: number) => {
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);
      if (dots) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(dots, 0, 0);
        ctx.restore();
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        const age = (now - r.born) / 1000;
        r.radius = Math.max(0, age * 400);
        r.opacity = Math.max(0, 1 - age * 1.2);
        if (r.opacity <= 0) ripples.splice(i, 1);
      }

      const cols = Math.max(2, Math.ceil(w / CELL_SIZE)) + 1;
      const rows = Math.max(2, Math.ceil(h / CELL_SIZE)) + 1;
      const cellW = w / (cols - 1);
      const cellH = h / (rows - 1);
      const pts: Point[][] = [];
      const prox: number[][] = [];

      for (let row = 0; row < rows; row++) {
        pts[row] = [];
        prox[row] = [];
        for (let col = 0; col < cols; col++) {
          const { pt, proximity } = warpedPoint(col * cellW, row * cellH, col, row, mouse, ripples, cols, rows);
          pts[row][col] = pt;
          prox[row][col] = proximity;
        }
      }

      const seg = (p1: Point, p2: Point, a: number, b: number) => {
        const avg = (a + b) / 2;
        const t = avg * avg * (3 - 2 * avg);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = lerpColor(LINE_BASE, LINE_ACTIVE, t);
        ctx.lineWidth = lerpN(0.8, 1.5, t);
        ctx.stroke();
      };

      for (let row = 0; row < rows; row++)
        for (let col = 0; col < cols - 1; col++)
          seg(pts[row][col], pts[row][col + 1], prox[row][col], prox[row][col + 1]);
      for (let col = 0; col < cols; col++)
        for (let row = 0; row < rows - 1; row++)
          seg(pts[row][col], pts[row + 1][col], prox[row][col], prox[row + 1][col]);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const p = pts[row][col];
          const pr = prox[row][col];
          const t = pr * pr * (3 - 2 * pr);
          const r = lerpN(NODE_BASE_RADIUS, NODE_ACTIVE_RADIUS, t);
          if (t > 0.3) {
            const glowR = r + lerpN(0, 7, (t - 0.3) / 0.7);
            const grd = ctx.createRadialGradient(p.x, p.y, r * 0.5, p.x, p.y, glowR);
            grd.addColorStop(0, `rgba(${GLOW},${(t * 0.35).toFixed(3)})`);
            grd.addColorStop(1, `rgba(${GLOW},0)`);
            ctx.beginPath();
            ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = lerpColor(NODE_BASE, NODE_ACTIVE, t);
          ctx.fill();
        }
      }

      for (const r of ripples) {
        ctx.beginPath();
        ctx.arc(r.x, r.y, Math.max(0, r.radius), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${RIPPLE},${(r.opacity * 0.35).toFixed(3)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    };

    // Ohne Maus: Geister-Cursor zieht langsame Bahnen (Lissajous) durchs Raster
    const autopilot = (now: number) => {
      const s = now / 1000;
      target.x = w * (0.5 + 0.34 * Math.sin(s * 0.23));
      target.y = h * (0.5 + 0.3 * Math.sin(s * 0.31 + 1.2));
    };

    const loop = (now: number) => {
      if (now - lastPointer > IDLE_AFTER_MS) autopilot(now);
      if (mouse.x === -9999) {
        mouse.x = target.x;
        mouse.y = target.y;
      }
      mouse.x = lerpN(mouse.x, target.x, LERP_SPEED);
      mouse.y = lerpN(mouse.y, target.y, LERP_SPEED);
      draw(now);
      raf = requestAnimationFrame(loop);
    };

    const local = (e: PointerEvent): Point => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return; // am Handy übernimmt der Autopilot
      const p = local(e);
      target.x = p.x;
      target.y = p.y;
      lastPointer = performance.now();
    };

    const onDown = (e: PointerEvent) => {
      const p = local(e);
      ripples.push({ x: p.x, y: p.y, radius: 0, opacity: 1, born: performance.now() });
      if (e.pointerType === 'mouse') lastPointer = performance.now();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    if (!reduceMotion) {
      wrap.addEventListener('pointermove', onMove);
      wrap.addEventListener('pointerdown', onDown);
      raf = requestAnimationFrame(loop);
    }

    return () => {
      ro.disconnect();
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerdown', onDown);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrapRef} className={cn('relative w-full overflow-hidden', className)} style={{ backgroundColor: BG }}>
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none" />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
