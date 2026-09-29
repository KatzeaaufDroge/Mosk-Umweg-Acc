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

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), galleryStatus()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
