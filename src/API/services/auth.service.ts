import { AxiosResponse } from "axios";
import { postRequest } from "../APICalls.ts";
import { IUserCredentials, IUserRegistration, IAuthResponse } from "../../utils/types/user.types.ts";

export const loginService = async (credentials: IUserCredentials): Promise<IAuthResponse> => {
  const response: AxiosResponse<IAuthResponse & { token?: string }> = await postRequest<IUserCredentials, IAuthResponse & { token?: string }>(
    "/users/login",
    credentials
  );
  
  // Temporaire: Si le serveur renvoie un token ET que les cookies ne marchent pas, l'utiliser
  if (response.data.token) {
    console.warn('🍪 Cookies httpOnly ne fonctionnent pas, fallback vers localStorage temporaire');
    localStorage.setItem('authToken', response.data.token);
  }
  
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
  // Appeler l'API pour supprimer le cookie côté serveur
  try {
    await postRequest<{}, { success: boolean; message: string }>("/users/logout", {});
  } catch (error) {
    console.error("Erreur lors de la déconnexion côté serveur:", error);
    // Continuer même si l'API échoue - la déconnexion côté client est prioritaire
  }
};

// Plus nécessaire avec les cookies httpOnly - supprimé
// export const getStoredToken = (): string | null => {
//   return localStorage.getItem('authToken');
// };