import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite Configuration
 *
 * VITE CONCEPT:
 * Vite is a modern build tool and dev server that replaced Create React App.
 * It's much faster because it uses native ES modules in development
 * (no bundling needed in dev mode — the browser loads files directly).
 *
 * The @vitejs/plugin-react plugin adds:
 * - Fast Refresh (hot module replacement without losing state)
 * - JSX transform (you don't need to import React in every file)
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Default Vite port — what we set in SANCTUM_STATEFUL_DOMAINS on backend
  },
})
