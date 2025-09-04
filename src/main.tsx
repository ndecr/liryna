import { createRoot } from "react-dom/client";
import App from "./App.tsx";

// context
import { UserProvider } from "./context/user/UserProvider.tsx";
import { CourrierProvider } from "./context/courrier/CourrierProvider.tsx";
import LoaderProvider from "./context/loader/LoaderProvider.tsx";

// PWA initialization
import { initializePWA } from "./utils/scripts/serviceWorker.ts";
import { getEnvironment, shouldEnablePWA, getBrowserInfo } from "./utils/scripts/browserDetection.ts";

// Initialize PWA features only in production and compatible browsers
try {
  const environment = getEnvironment();
  const canUsePWA = shouldEnablePWA();
  
  // Log browser info for debugging
  console.log('[PWA] Browser info:', getBrowserInfo());
  
  if (environment === 'production' && canUsePWA) {
    initializePWA().catch((error) => {
      console.warn('[PWA] Failed to initialize:', error);
    });
  } else {
    console.log(`[PWA] PWA disabled - Environment: ${environment}, Compatible: ${canUsePWA}`);
  }
} catch (error) {
  // Fallback silencieux pour éviter de casser l'app
  console.warn('[PWA] PWA initialization failed:', error);
}

createRoot(document.getElementById("root")!).render(
  <UserProvider>
    <CourrierProvider>
      <LoaderProvider>
        <App />
      </LoaderProvider>
    </CourrierProvider>
  </UserProvider>,
);
