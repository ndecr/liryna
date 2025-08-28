import { createRoot } from "react-dom/client";
import App from "./App.tsx";

// context
import { UserProvider } from "./context/user/UserProvider.tsx";
import { CourrierProvider } from "./context/courrier/CourrierProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <UserProvider>
    <CourrierProvider>
      <App />
    </CourrierProvider>
  </UserProvider>,
);
