// hooks | libraries
import { useState, useMemo, ReactElement, useEffect } from "react";

// context
import { UserContext } from "./UserContext.tsx";

// custom types
import { IUser, IUserCredentials, IUserRegistration } from "../../utils/types/user.types.ts";

// services
import { getCurrentUserService } from "../../API/services/user.service.ts";
import { loginService, registerService, logoutService, getStoredToken } from "../../API/services/auth.service.ts";

export const UserProvider = ({
  children,
}: {
  children: ReactElement;
}): ReactElement => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isAuthenticated = useMemo(() => !!user && !!getStoredToken(), [user]);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const initAuth = async () => {
      const token = getStoredToken();
      if (token) {
        try {
          await getCurrentUser();
        } catch (error) {
          console.error("Token invalid, logging out:", error);
          logout();
        }
      }
      setIsLoading(false);
    };
    
    initAuth();
  }, []);

  const login = async (credentials: IUserCredentials): Promise<void> => {
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
  };

  const register = async (userData: IUserRegistration): Promise<void> => {
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
  };

  const logout = (): void => {
    logoutService();
    setUser(null);
  };

  const getCurrentUser = async (): Promise<void> => {
    try {
      const currentUser = await getCurrentUserService();
      setUser(currentUser);
    } catch (error) {
      console.error("Error while getting current user:", error);
      setUser(null);
      throw error;
    }
  };

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
