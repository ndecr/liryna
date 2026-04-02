export interface IVisibleSections {
  mail: boolean;
  budget: boolean;
  musique: boolean;
}

export interface IUser {
  id: number;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  visibleSections?: IVisibleSections;
  created_at?: string;
  updated_at?: string;
}
export interface IUserCredentials {
  email: string;
  password: string;
}
export interface IUserRegistration extends IUserCredentials {
  firstName: string;
  lastName: string;
}
export interface IAuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: IUser;
}
export interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}
export interface IChangeEmailData {
  newEmail: string;
  password: string;
}
export interface IChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface IUser {
    id: number
    email: string
    password?: string
    firstName: string
    lastName: string
    avatarUrl?: string | null
    visibleSections?: IVisibleSections
    created_at?: string
    updated_at?: string
}

export interface IUserCredentials {
    email: string
    password: string
}

export interface IUserRegistration {
    email: string
    password: string
    firstName: string
    lastName: string
}

export interface IAuthResponse {
    success: boolean
    message: string
    token?: string
    user?: IUser
}

export interface IApiResponse<T = unknown> {
    success: boolean
    message: string
    data?: T
}