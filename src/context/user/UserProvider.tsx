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
  deleteAvatarService,
  deleteMyAccountService,
  changeMyEmailService,
  changeMyPasswordService,
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
      await loginService(credentials);
      await getCurrentUser();
    } catch (error) {
      console.error("Error while logging in:", error);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentUser]);

  const register = useCallback(async (userData: IUserRegistration): Promise<void> => {
    setIsLoading(true);
    try {
      await registerService(userData);
      await getCurrentUser();
    } catch (error) {
      console.error("Error while registering:", error);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentUser]);

  const updatePreferences = useCallback(async (visibleSections: IVisibleSections): Promise<void> => {
    const updated = await updateUserPreferencesService(visibleSections);
    setUser(updated);
  }, []);

  const uploadAvatar = useCallback(async (file: File): Promise<void> => {
    const avatarUrl = await uploadAvatarService(file);
    const avatarUrlWithBust = avatarUrl ? `${avatarUrl}?t=${Date.now()}` : avatarUrl;
    setUser((prev) => (prev ? { ...prev, avatarUrl: avatarUrlWithBust } : prev));
  }, []);

  const deleteAvatar = useCallback(async (): Promise<void> => {
    await deleteAvatarService();
    setUser((prev) => (prev ? { ...prev, avatarUrl: null } : prev));
  }, []);

  const deleteAccount = useCallback(async (): Promise<void> => {
    await deleteMyAccountService();
    csrfService.clearToken();
    setUser(null);
  }, []);

  const changeEmail = useCallback(async (newEmail: string, password: string): Promise<void> => {
    const response = await changeMyEmailService(newEmail, password);
    
    setUser((prev) => (prev ? { ...prev, email: newEmail, avatarUrl: response.avatarUrl } : prev));
    
    csrfService.clearToken();
    await csrfService.getToken();
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<void> => {
    await changeMyPasswordService(currentPassword, newPassword);
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
      deleteAvatar,
      deleteAccount,
      changeEmail,
      changePassword,
    }),
    [user, isAuthenticated, isLoading, login, register, logout, getCurrentUser, updatePreferences, uploadAvatar, deleteAvatar, deleteAccount, changeEmail, changePassword],
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
