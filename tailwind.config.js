/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Grün aus dem Mosk-Logo – überall für Grün verwenden
        brand: {
          DEFAULT: '#55a041',
          dark: '#4a8a38',
          // Hover für volle Grün-Buttons: heller, schwarze Schrift bleibt gut lesbar (8,2:1)
          light: '#61b54a',
        },
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
        },
      },
    },
  },
  plugins: [],
};
