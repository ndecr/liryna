// hooks | libraries
import { useState, useMemo, ReactElement, useEffect, useCallback } from "react";

// context
import { UserContext } from "./UserContext.tsx";

// custom types
import { IUser, IUserCredentials, IUserRegistration } from "../../utils/types/user.types.ts";

// services
import { getCurrentUserService } from "../../API/services/user.service.ts";
import { loginService, registerService, logoutService } from "../../API/services/auth.service.ts";
import { csrfService } from "../../utils/services/csrfService.ts";

export const UserProvider = ({
  children,
}: {
  children: ReactElement;
}): ReactElement => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isAuthenticated = useMemo(() => !!user, [user]);

  const getCurrentUser = useCallback(async (): Promise<void> => {
    try {
      const currentUser = await getCurrentUserService();
      setUser(currentUser);
    } catch (error) {
      console.error("Error while getting current user:", error);
      setUser(null);
      throw error;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await logoutService();
    csrfService.clearToken();
    setUser(null);
  }, []);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const initAuth = async () => {
      // Avec les cookies httpOnly, on tente directement de récupérer le profil utilisateur
      // Le cookie sera automatiquement envoyé si présent
      try {
        await getCurrentUser();
      } catch (error) {
        console.error("Token invalid, logging out:", error);
        await logout();
      }
      setIsLoading(false);
    };
    
    initAuth();
  }, [getCurrentUser, logout]);

  const login = useCallback(async (credentials: IUserCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await loginService(credentials);
      if (response.user) {
        setUser(response.user);
      }
    } catch (error) {
      console.error("Error while logging in:", error);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: IUserRegistration): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await registerService(userData);
      
      // Gestion de la réponse avec structure différente (data au lieu de user)
      const user = response.user || (response as { data?: IUser }).data;
      
      if (user) {
        setUser(user);
      }
    } catch (error) {
      console.error("Error while registering:", error);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      setUser,
      login,
      register,
      logout,
      getCurrentUser,
    }),
    [user, isAuthenticated, isLoading],
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
