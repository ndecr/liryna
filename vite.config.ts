import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Plugin pour générer CSP adaptée à l'environnement
const generateCSP = () => {
  return {
    name: 'generate-csp',
    buildStart() {
      const isDev = process.env.NODE_ENV === 'development';
      
      // CSP stricte pour production
      const prodCSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.liryna.app; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';";
      
      // CSP permissive pour développement
      const devCSP = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.liryna.app https://localhost:8800; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';";
      
      const cspValue = isDev ? devCSP : prodCSP;
      
      // Générer vercel.json avec la CSP appropriée
      const vercelConfig = {
        "rewrites": [
          {
            "source": "/(.*)",
            "destination": "/index.html"
          }
        ],
        "headers": [
          {
            "source": "/(.*)",
            "headers": [
              {
                "key": "Content-Security-Policy",
                "value": cspValue
              },
              {
                "key": "X-Content-Type-Options",
                "value": "nosniff"
              },
              {
                "key": "X-Frame-Options", 
                "value": "DENY"
              },
              {
                "key": "Referrer-Policy",
                "value": "strict-origin-when-cross-origin"
              },
              {
                "key": "Permissions-Policy",
                "value": "geolocation=(), microphone=(), camera=(), fullscreen=(), payment=()"
              }
            ]
          }
        ]
      };
      
      writeFileSync(join(__dirname, 'vercel.json'), JSON.stringify(vercelConfig, null, 2));
      console.log(`✅ CSP generated for ${isDev ? 'development' : 'production'}`);
    }
  };
};

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
  plugins: [react(), generateCSP(), injectVersion()],
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
