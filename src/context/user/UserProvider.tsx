// hooks | libraries
import { useState, useMemo, ReactElement, useEffect, useCallback } from "react";

// context
import { UserContext } from "./UserContext.tsx";

// custom types
import { IUser, IUserCredentials, IUserRegistration, IVisibleSections } from "../../utils/types/user.types.ts";

// services
import {
  getCurrentUserService,
  updateUserPreferencesService,
  uploadAvatarService,
  deleteMyAccountService,
} from "../../API/services/user.service.ts";
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
      const registeredUser = response.user || (response as { data?: IUser }).data;
      if (registeredUser) {
        setUser(registeredUser);
      }
    } catch (error) {
      console.error("Error while registering:", error);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(async (visibleSections: IVisibleSections): Promise<void> => {
    const updated = await updateUserPreferencesService(visibleSections);
    setUser(updated);
  }, []);

  const uploadAvatar = useCallback(async (file: File): Promise<void> => {
    const avatarUrl = await uploadAvatarService(file);
    setUser((prev) => (prev ? { ...prev, avatarUrl } : prev));
  }, []);

  const deleteAccount = useCallback(async (): Promise<void> => {
    await deleteMyAccountService();
    csrfService.clearToken();
    setUser(null);
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
      updatePreferences,
      uploadAvatar,
      deleteAccount,
    }),
    [user, isAuthenticated, isLoading, login, register, logout, getCurrentUser, updatePreferences, uploadAvatar, deleteAccount],
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
