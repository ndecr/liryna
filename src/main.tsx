import { createRoot } from "react-dom/client";
import App from "./App.tsx";

// context
import { UserProvider } from "./context/user/UserProvider.tsx";
import { CourrierProvider } from "./context/courrier/CourrierProvider.tsx";
import LoaderProvider from "./context/loader/LoaderProvider.tsx";

// PWA initialization
import { initializePWA } from "./utils/scripts/serviceWorker.ts";

// Initialize PWA features only in production
// In development, PWA features are limited to avoid conflicts with Vite HMR
if (import.meta.env.PROD) {
  initializePWA().catch(console.error);
} else {
  console.log('[PWA] Development mode - PWA features disabled');
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
