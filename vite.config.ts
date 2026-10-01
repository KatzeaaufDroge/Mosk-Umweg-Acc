import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Stand der Galerie für die Admin-Übersicht (/admin/galerie-status.json):
// pro Kategorie Anzahl, Sichtbarkeit und ein paar Vorschaubilder.
// Spiegelt, was auf der Website zu sehen ist (Regel wie in src/data/gallery.ts).
function galleryStatus(): Plugin {
  const dir = path.resolve(__dirname, 'content/galerie');
  const build = () =>
    fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => {
        const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
        const bilder = (d.bilder ?? []).filter((b: { bild?: string }) => b.bild);
        return {
          id: f.replace(/\.json$/, ''),
          title: d.title,
          bereich: d.bereich || 'Fotografie',
          reihenfolge: d.reihenfolge ?? 999,
          ausgeblendet: d.sichtbar === false,
          anzahl: bilder.length,
          videos: bilder.filter((b: { video?: string }) => b.video).length,
          layout: d.layout || 'mosaik',
          vorschau: bilder.slice(0, 4).map((b: { bild: string }) => b.bild),
        };
      })
      .sort((a, b) => a.reihenfolge - b.reihenfolge);

  return {
    name: 'gallery-status',
    configureServer(server) {
      server.middlewares.use('/admin/galerie-status.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-store');
        res.end(JSON.stringify({ kategorien: build() }));
      });
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'admin/galerie-status.json',
        source: JSON.stringify({ stand: new Date().toISOString(), kategorien: build() }),
      });
    },
  };
}

// Verkleinerte WebP-Versionen aller Galerie-Bilder für den Build
// (dist/gallery/_w/<datei>-<breite>.webp). Dima lädt Kamera-Originale hoch,
// ausgeliefert werden nur passende Größen. Muss zu GALLERY_WIDTHS in
// src/data/gallery.ts passen. Originale bleiben für das Admin-Panel erhalten.
const GALLERY_WIDTHS = [480, 900, 1400, 2000];

function galleryImages(): Plugin {
  let outDir = 'dist';
  return {
    name: 'gallery-images',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      const sharp = (await import('sharp')).default;
      const src = path.resolve(__dirname, 'public/gallery');
      const dest = path.join(outDir, 'gallery/_w');
      fs.mkdirSync(dest, { recursive: true });
      const files = fs.readdirSync(src).filter((f) => /\.(jpe?g|png|webp|avif|tiff?)$/i.test(f));
      let count = 0;
      for (const file of files) {
        for (const width of GALLERY_WIDTHS) {
          const target = path.join(dest, `${file}-${width}.webp`);
          await sharp(path.join(src, file))
            .rotate() // Handy-Fotos: Ausrichtung aus EXIF übernehmen
            .resize({ width, withoutEnlargement: true })
            .webp({ quality: 78 })
            .toFile(target);
          count++;
        }
      }
      console.log(`gallery-images: ${count} WebP-Versionen aus ${files.length} Bildern erzeugt`);

      // Schutzregeln für den Galerie-Ordner erst hier dazulegen – im
      // Repo-Ordner public/gallery würde Dima sie im Admin als "Datei" sehen.
      fs.copyFileSync(path.resolve(__dirname, 'hostinger/gallery.htaccess'), path.join(outDir, 'gallery/.htaccess'));
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), galleryStatus(), galleryImages()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
