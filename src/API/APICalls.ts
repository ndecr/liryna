// libraries
import axios, { AxiosResponse } from "axios";

// utils
import { getApiBaseUrl } from "../utils/scripts/utils.ts";

axios.defaults.timeout = 10000;
axios.defaults.baseURL = getApiBaseUrl();
axios.defaults.withCredentials = false;

// Interceptor pour ajouter le token JWT automatiquement
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    // S'assurer que headers existe
    if (!config.headers) {
      config.headers = {};
    }
    // Convertir en objet simple si c'est une instance AxiosHeaders
    if (typeof config.headers === 'object' && config.headers.constructor.name === 'AxiosHeaders') {
      config.headers = { ...config.headers };
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getRequest: (url: string) => Promise<AxiosResponse> = async (
  url: string,
): Promise<AxiosResponse> => {
  return await axios.get(url);
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
      headers: {}
    };
    
    // Ajouter le token d'auth manuellement pour éviter les conflits
    if (token) {
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
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
