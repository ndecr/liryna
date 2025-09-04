// Service Worker registration et gestion pour What a tool PWA

const SW_URL = '/sw.js';
const isProduction = import.meta.env.PROD;

// Types pour les messages du Service Worker
interface ServiceWorkerMessage {
  type: 'SKIP_WAITING' | 'GET_VERSION' | 'CLEAR_CACHE';
  payload?: unknown;
}

interface ServiceWorkerResponse {
  version?: string;
  success?: boolean;
}

// Vérifier si les Service Workers sont supportés
export const isServiceWorkerSupported = (): boolean => {
  return 'serviceWorker' in navigator;
};

// Vérifier si l'app peut être installée (PWA)
export const isPWAInstallable = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

// Enregistrer le Service Worker
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!isServiceWorkerSupported()) {
    console.warn('[PWA] Service Workers not supported');
    return null;
  }

  try {
    console.log('[PWA] Registering service worker...');
    const registration = await navigator.serviceWorker.register(SW_URL);
    
    console.log('[PWA] Service worker registered successfully');
    
    // Écouter les mises à jour du Service Worker
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        console.log('[PWA] New service worker installing...');
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[PWA] New service worker installed, update available');
            // Notifier l'utilisateur qu'une mise à jour est disponible
            showUpdateAvailableNotification();
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('[PWA] Service worker registration failed:', error);
    return null;
  }
};

// Désenregistrer le Service Worker
export const unregisterServiceWorker = async (): Promise<boolean> => {
  if (!isServiceWorkerSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const unregistered = await registration.unregister();
      console.log('[PWA] Service worker unregistered:', unregistered);
      return unregistered;
    }
    return true;
  } catch (error) {
    console.error('[PWA] Service worker unregistration failed:', error);
    return false;
  }
};

// Envoyer un message au Service Worker
export const sendMessageToServiceWorker = async (
  message: ServiceWorkerMessage
): Promise<ServiceWorkerResponse | null> => {
  if (!navigator.serviceWorker.controller) {
    console.warn('[PWA] No active service worker to send message to');
    return null;
  }

  return new Promise((resolve) => {
    const messageChannel = new MessageChannel();
    
    messageChannel.port1.onmessage = (event) => {
      resolve(event.data);
    };

    const controller = navigator.serviceWorker.controller;
    if (controller) {
      controller.postMessage(message, [messageChannel.port2]);
    }
    
    // Timeout après 5 secondes
    setTimeout(() => resolve(null), 5000);
  });
};

// Forcer l'activation d'un nouveau Service Worker
export const skipWaiting = async (): Promise<void> => {
  await sendMessageToServiceWorker({ type: 'SKIP_WAITING' });
  window.location.reload();
};

// Vider le cache
export const clearCache = async (): Promise<boolean> => {
  const response = await sendMessageToServiceWorker({ type: 'CLEAR_CACHE' });
  return response?.success || false;
};

// Obtenir la version du Service Worker
export const getServiceWorkerVersion = async (): Promise<string | null> => {
  const response = await sendMessageToServiceWorker({ type: 'GET_VERSION' });
  return response?.version || null;
};

// Vérifier l'état de la connexion
export const checkOnlineStatus = (): boolean => {
  return navigator.onLine;
};

// Écouter les changements de connexion
export const addConnectionListeners = (
  onOnline: () => void,
  onOffline: () => void
): (() => void) => {
  const handleOnline = () => {
    console.log('[PWA] Connection restored');
    onOnline();
  };

  const handleOffline = () => {
    console.log('[PWA] Connection lost');
    onOffline();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Retourner une fonction de nettoyage
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

// Notification de mise à jour disponible
const showUpdateAvailableNotification = (): void => {
  // Créer une notification personnalisée ou utiliser une modal
  const shouldUpdate = confirm(
    'Une nouvelle version de l\'application est disponible. Voulez-vous l\'installer maintenant ?'
  );

  if (shouldUpdate) {
    skipWaiting();
  }
};

// Vérifier si l'app est installée (PWA)
export const isPWAInstalled = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.matchMedia('(display-mode: fullscreen)').matches ||
         // @ts-ignore - Pour Safari
         (window.navigator as any).standalone === true;
};

// Prompt d'installation PWA
export const showInstallPrompt = (): Promise<boolean> => {
  return new Promise((resolve) => {
    let deferredPrompt: any = null;

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Montrer un bouton d'installation personnalisé
      const shouldInstall = confirm(
        'Voulez-vous installer What a tool sur votre appareil pour une meilleure expérience ?'
      );

      if (shouldInstall && deferredPrompt) {
        deferredPrompt.prompt();
        
        deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('[PWA] User accepted the install prompt');
            resolve(true);
          } else {
            console.log('[PWA] User dismissed the install prompt');
            resolve(false);
          }
          deferredPrompt = null;
        });
      } else {
        resolve(false);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Nettoyage après 10 secondes
    setTimeout(() => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if (!deferredPrompt) {
        resolve(false);
      }
    }, 10000);
  });
};

// Initialisation complète de la PWA
export const initializePWA = async (): Promise<void> => {
  if (!isProduction) {
    console.log('[PWA] Development mode - PWA features limited');
  }

  // Enregistrer le Service Worker
  await registerServiceWorker();

  // Ajouter les listeners de connexion
  addConnectionListeners(
    () => {
      // Connexion rétablie
      document.body.classList.remove('offline');
      document.body.classList.add('online');
    },
    () => {
      // Connexion perdue
      document.body.classList.remove('online');
      document.body.classList.add('offline');
    }
  );

  // Vérifier si l'app est déjà installée
  if (!isPWAInstalled()) {
    // Attendre un peu avant de proposer l'installation
    setTimeout(() => {
      showInstallPrompt();
    }, 5000);
  }

  console.log('[PWA] PWA initialization complete');
};