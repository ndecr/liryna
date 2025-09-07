// libraries
import axios, { AxiosResponse } from "axios";

// utils
import { getApiBaseUrl } from "../utils/scripts/utils.ts";
import { csrfService } from "../utils/services/csrfService.ts";

axios.defaults.timeout = 10000;
axios.defaults.baseURL = getApiBaseUrl();
axios.defaults.withCredentials = false;

// Interceptor pour ajouter le token JWT et CSRF automatiquement
axios.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
    
    // Ajouter le token CSRF pour les méthodes protégées
    const protectedMethods = ['post', 'patch', 'delete'];
    if (protectedMethods.includes(config.method?.toLowerCase() || '')) {
      try {
        // Exclure les routes de login/register/csrf-token
        const isAuthRoute = config.url?.includes('/login') || 
                           config.url?.includes('/register') || 
                           config.url?.includes('/csrf-token');
        if (!isAuthRoute) {
          const csrfHeaders = await csrfService.getCSRFHeaders();
          Object.assign(config.headers as Record<string, string>, csrfHeaders);
        }
      } catch (error) {
        console.warn('Impossible d\'ajouter le token CSRF:', error);
      }
    }
  }
  return config;
});

export const getRequest: (url: string, config?: Record<string, unknown>) => Promise<AxiosResponse> = async (
  url: string,
  config?: Record<string, unknown>
): Promise<AxiosResponse> => {
  return await axios.get(url, config);
};

export const postRequest = async <T, R>(
  url: string,
  data: T,
): Promise<AxiosResponse<R>> => {
  try {
    const config: Record<string, unknown> = {};
    
    // Si ce n'est pas du FormData, définir JSON comme Content-Type
    if (!(data instanceof FormData)) {
      config.headers = {
        'Content-Type': 'application/json'
      };
    }
    
    return await axios.post<R>(url, data, config);
  } catch (error) {
    console.error("Erreur in postRequest:", error);
    throw error;
  }
};

// Méthode spécifique pour les uploads de fichiers avec FormData
export const postFormDataRequest = async <R>(
  url: string,
  formData: FormData,
): Promise<AxiosResponse<R>> => {
  try {
    const token = localStorage.getItem('authToken');
    const config: Record<string, unknown> = {
      headers: {} as Record<string, string>
    };
    
    // Ajouter le token d'auth manuellement pour éviter les conflits
    if (token) {
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
      
      // Ajouter le token CSRF
      try {
        const csrfHeaders = await csrfService.getCSRFHeaders();
        Object.assign(config.headers as Record<string, string>, csrfHeaders);
      } catch (error) {
        console.warn('Impossible d\'ajouter le token CSRF au FormData:', error);
      }
    }
    
    // Ne PAS définir Content-Type - laisser le navigateur le faire
    return await axios.post<R>(url, formData, config);
  } catch (error) {
    console.error("Erreur in postFormDataRequest:", error);
    throw error;
  }
};

export const patchRequest = async <T, R>(
  url: string,
  data: T,
): Promise<AxiosResponse<R>> => {
  try {
    return await axios.patch<R>(url, data);
  } catch (error) {
    console.error("Erreur in patchRequest:", error);
    throw error;
  }
};

export const deleteRequest = async <R>(
  url: string,
): Promise<AxiosResponse<R>> => {
  try {
    return await axios.delete<R>(url);
  } catch (error) {
    console.error("Erreur in deleteRequest:", error);
    throw error;
  }
};
