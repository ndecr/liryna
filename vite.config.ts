import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Plugin pour générer et injecter la version dans le service worker
const injectVersion = () => {
  return {
    name: 'inject-version',
    buildStart() {
      // Générer une version unique basée sur timestamp
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      
      const version = `${year}.${month}.${day}.${hours}${minutes}.${seconds}`;
      
      // Injecter la version dans les variables d'environnement
      process.env.VITE_APP_VERSION = version;
    },
    writeBundle() {
      // Après le build, remplacer le placeholder dans le service worker
      const swPath = join(__dirname, 'dist/sw.js');
      const publicSwPath = join(__dirname, 'public/sw.js');
      
      try {
        // Copier le sw.js vers dist/ et remplacer le placeholder
        let swContent = readFileSync(publicSwPath, 'utf8');
        swContent = swContent.replace(/__BUILD_VERSION__/g, process.env.VITE_APP_VERSION || 'unknown');
        writeFileSync(swPath, swContent);
        console.log(`✅ Service Worker version updated: ${process.env.VITE_APP_VERSION}`);
      } catch (error) {
        console.warn('⚠️ Could not update service worker version:', error);
      }
    }
  };
};

export default defineConfig({
  plugins: [react(), injectVersion()],
  base: "/",
  build: {
    // Optimisations pour PWA
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          icons: ['react-icons'],
        }
      }
    },
    // Assurer que les assets nécessaires sont copiés
    copyPublicDir: true,
    // Service Worker et manifest dans les assets
    assetsDir: 'assets',
  },
  // Configuration PWA
  server: {
    // HTTPS nécessaire pour certaines fonctionnalités PWA en dev
    // https: true, // Décommenter si besoin
    port: 5173,
  },
  // Optimisations
  define: {
    // Éliminer les console.log en production
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
});
