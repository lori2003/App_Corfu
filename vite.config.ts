/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base path relativo: funziona sia in locale sia quando l'app viene pubblicata
// in un sottopercorso di GitHub Pages (es. https://utente.github.io/app_corfu/).
// Puo' essere sovrascritto con la variabile d'ambiente VITE_BASE in fase di build.
const base = process.env.VITE_BASE ?? './';

export default defineConfig({
  base,
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
