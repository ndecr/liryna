export const isOnProduction = (): boolean => {
  const hostname: string = window.location.hostname;
  return hostname !== "localhost";
};

export const getApiBaseUrl = (): string => {
  if (isOnProduction()) {
    // Production avec HTTPS et certificat Let's Encrypt valide
    return "https://ndecrolympe.duckdns.org/api";
  } else {
    // En développement local, utiliser IP locale
    return "https://ndecrolympe.duckdns.org/api";
    // return "http://192.168.1.56:8800/api";
  }
};
