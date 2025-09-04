import { createRoot } from "react-dom/client";
import App from "./App.tsx";

// context
import { UserProvider } from "./context/user/UserProvider.tsx";
import { CourrierProvider } from "./context/courrier/CourrierProvider.tsx";
import LoaderProvider from "./context/loader/LoaderProvider.tsx";

// PWA initialization
import { initializePWA } from "./utils/scripts/serviceWorker.ts";

// Initialize PWA features
if (import.meta.env.PROD) {
  initializePWA().catch(console.error);
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
