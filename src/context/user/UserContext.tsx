// custom types
import { IUser, IUserCredentials, IUserRegistration, IVisibleSections } from "../../utils/types/user.types.ts";
import { createContext, Context } from "react";

interface IUserContext {
    user: IUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: IUser | null) => void;
    login: (credentials: IUserCredentials) => Promise<void>;
    register: (userData: IUserRegistration) => Promise<void>;
    logout: () => void;
    getCurrentUser: () => Promise<void>;
    updatePreferences: (visibleSections: IVisibleSections) => Promise<void>;
    uploadAvatar: (file: File) => Promise<void>;
    deleteAvatar: () => Promise<void>;
    deleteAccount: () => Promise<void>;
    changeEmail: (newEmail: string, password: string) => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export const UserContext: Context<IUserContext> = createContext<IUserContext>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    setUser: (): void => {},
    login: async (): Promise<void> => {},
    register: async (): Promise<void> => {},
    logout: (): void => {},
    getCurrentUser: async (): Promise<void> => {},
    updatePreferences: async (): Promise<void> => {},
    uploadAvatar: async (): Promise<void> => {},
    deleteAvatar: async (): Promise<void> => {},
    deleteAccount: async (): Promise<void> => {},
    changeEmail: async (): Promise<void> => {},
    changePassword: async (): Promise<void> => {},
});
