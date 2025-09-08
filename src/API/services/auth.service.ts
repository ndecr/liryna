import { AxiosResponse } from "axios";
import { postRequest } from "../APICalls.ts";
import { IUserCredentials, IUserRegistration, IAuthResponse } from "../../utils/types/user.types.ts";

export const loginService = async (credentials: IUserCredentials): Promise<IAuthResponse> => {
  const response: AxiosResponse<IAuthResponse & { token?: string }> = await postRequest<IUserCredentials, IAuthResponse & { token?: string }>(
    "/users/login",
    credentials
  );
  
  // Le token JWT est maintenant dans un cookie httpOnly cross-domain (.liryna.app)
  // Plus besoin de localStorage - sécurité maximale contre XSS
  
  return response.data;
};

export const registerService = async (userData: IUserRegistration): Promise<IAuthResponse> => {
  const response: AxiosResponse<IAuthResponse> = await postRequest<IUserRegistration, IAuthResponse>(
    "/users/register",
    userData
  );
  
  // Plus de gestion localStorage - le token JWT est maintenant dans un cookie httpOnly sécurisé
  return response.data;
};

export const logoutService = async (): Promise<void> => {
  // Appeler l'API pour supprimer le cookie httpOnly côté serveur
  try {
    await postRequest<{}, { success: boolean; message: string }>("/users/logout", {});
  } catch (error) {
    console.error("Erreur lors de la déconnexion côté serveur:", error);
    // Continuer même si l'API échoue - le cookie sera nettoyé côté serveur
  }
  
  // Plus besoin de nettoyer localStorage - tout est dans le cookie httpOnly
};

// Plus nécessaire avec les cookies httpOnly - supprimé
// export const getStoredToken = (): string | null => {
//   return localStorage.getItem('authToken');
// };