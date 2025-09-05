// Script pour générer automatiquement la version de l'application
// Ce script sera appelé lors du build pour générer un hash unique

export const generateVersionHash = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
};

export const generateBuildVersion = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  
  return `${year}.${month}.${day}.${hours}${minutes}`;
};

export const getCurrentVersion = (): string => {
  // En développement, utiliser une version fixe
  if (import.meta.env?.DEV) {
    return 'dev-mode';
  }
  
  // En production, utiliser la version injectée par Vite ou générer une version basée sur le timestamp
  return import.meta.env?.VITE_APP_VERSION || generateBuildVersion();
};