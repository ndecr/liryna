export const isOnProduction = (): boolean => {
  const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const isDevPort = ["5173", "5174", "5175"].includes(window.location.port); // Ports de développement Vite
  return !(isDev && isDevPort);
};

export const getApiBaseUrl = (): string => {
  const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const isDevPort = ["5173", "5174", "5175"].includes(window.location.port); // Ports de développement Vite
  
  if (isDev && isDevPort) {
    // Environnement de développement - utiliser le backend local
    const devUrl = "http://localhost:8800/api";
    console.log('🔧 Mode développement détecté - Backend:', devUrl);
    return devUrl;
  } else {
    // Production - utiliser le backend de production
    const prodUrl = "https://ndecrolympe.duckdns.org/api";
    console.log('🚀 Mode production détecté - Backend:', prodUrl);
    return prodUrl;
  }
};

/**
 * Détermine l'environnement actuel de l'application
 */
export const getEnvironment = (): 'development' | 'production' => {
  const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const isDevPort = ["5173", "5174", "5175"].includes(window.location.port);
  return (isDev && isDevPort) ? 'development' : 'production';
};

/**
 * Logs des informations sur l'environnement au démarrage
 */
export const logEnvironmentInfo = (): void => {
  const env = getEnvironment();
  const apiUrl = getApiBaseUrl();
  
  console.group('🌍 Configuration Environnement');
  console.log('Environnement:', env);
  console.log('Hostname:', window.location.hostname);
  console.log('Port:', window.location.port);
  console.log('API Backend:', apiUrl);
  console.groupEnd();
};
