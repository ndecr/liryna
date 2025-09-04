// hooks | libraries
import { ReactElement, useState, useEffect } from "react";
import { MdDownload, MdPhoneIphone } from "react-icons/md";

// hooks
import { usePWAInstall } from "../../utils/hooks/usePWA";

interface PWAInstallButtonProps {
  className?: string;
  variant?: "mobile" | "desktop";
  compact?: boolean;
}

function PWAInstallButton({ 
  className = "", 
  variant = "mobile",
  compact = true
}: PWAInstallButtonProps): ReactElement | null {
  const { isInstalled } = usePWAInstall();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showButton, setShowButton] = useState<boolean>(false);

  // Écouter l'événement beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };

    const handleAppInstalled = () => {
      setShowButton(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
        setShowButton(false);
      }
      setDeferredPrompt(null);
    } else if (debugMode) {
      // En mode debug, afficher des infos utiles
      console.log('[PWA Debug] Install button clicked but no prompt available');
      console.log('[PWA Debug] isInstalled:', isInstalled);
      console.log('[PWA Debug] showButton:', showButton);
      console.log('[PWA Debug] deferredPrompt:', !!deferredPrompt);
      alert('Mode debug: Bouton PWA visible mais pas de prompt disponible.\nVérifiez la console pour plus d\'infos.');
    }
  };

  // Mode debug - afficher toujours en développement pour tester
  const debugMode = import.meta.env.DEV;
  
  // Ne pas afficher si déjà installé ou pas installable (sauf en mode debug)
  if (!debugMode && (isInstalled || !showButton || !deferredPrompt)) {
    return null;
  }

  if (compact) {
    return (
      <button
        className={`pwa-install-btn compact ${variant} ${className}`}
        onClick={handleInstallClick}
        title="Installer l'application"
      >
        <MdDownload />
        {variant === "mobile" && (
          <span>
            Installer l'app
            {debugMode && !deferredPrompt && " (Debug)"}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      className={`pwa-install-btn full ${variant} ${className}`}
      onClick={handleInstallClick}
    >
      <MdPhoneIphone />
      <div className="install-text">
        <span className="install-title">Installer l'application</span>
        <span className="install-subtitle">Pour une meilleure expérience</span>
      </div>
    </button>
  );
}

export default PWAInstallButton;