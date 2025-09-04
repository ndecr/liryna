// Détection du navigateur et de la plateforme pour la compatibilité PWA

export const isSafari = (): boolean => {
  try {
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes('safari') && !userAgent.includes('chrome') && !userAgent.includes('chromium');
  } catch {
    return false;
  }
};

export const isIOS = (): boolean => {
  try {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  } catch {
    return false;
  }
};

export const isSafariIOS = (): boolean => {
  return isIOS() && isSafari();
};

export const isChrome = (): boolean => {
  try {
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes('chrome') || userAgent.includes('chromium');
  } catch {
    return false;
  }
};

export const supportsServiceWorker = (): boolean => {
  try {
    return 'serviceWorker' in navigator;
  } catch {
    return false;
  }
};

export const supportsImportMeta = (): boolean => {
  try {
    // Tenter d'accéder à import.meta sans causer d'erreur
    return typeof import.meta === 'object' && import.meta !== null;
  } catch {
    return false;
  }
};

export const getEnvironment = (): 'development' | 'production' => {
  try {
    if (!supportsImportMeta()) {
      // Fallback: considérer comme production si on ne peut pas détecter
      return 'production';
    }
    return import.meta.env?.PROD ? 'production' : 'development';
  } catch {
    return 'production';
  }
};

export const shouldEnablePWA = (): boolean => {
  // Désactiver la PWA sur Safari iOS pour éviter les conflits
  if (isSafariIOS()) {
    console.log('[PWA] Safari iOS detected - PWA features limited');
    return false;
  }
  
  return supportsServiceWorker();
};

export const getBrowserInfo = () => {
  return {
    isSafari: isSafari(),
    isIOS: isIOS(),
    isSafariIOS: isSafariIOS(),
    isChrome: isChrome(),
    supportsServiceWorker: supportsServiceWorker(),
    supportsImportMeta: supportsImportMeta(),
    environment: getEnvironment(),
    shouldEnablePWA: shouldEnablePWA(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
  };
};