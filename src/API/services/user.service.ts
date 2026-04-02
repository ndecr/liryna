import { getRequest, patchRequest, deleteRequest, postFormDataRequest } from "../APICalls.ts";
import { AxiosResponse } from "axios";
import { IUser, IApiResponse, IVisibleSections } from "../../utils/types/user.types.ts";
import { userModel } from "../models/user.model.ts";

export const getCurrentUserService = async (): Promise<IUser> => {
  const response: AxiosResponse<IApiResponse<IUser>> = await getRequest("/users/profile");
  
  if (response.data.success && response.data.data) {
    return userModel(response.data.data);
  }
  
  throw new Error(response.data.message || "Failed to get user profile");
};

export const getAllUsersService = async (): Promise<IUser[]> => {
  const response: AxiosResponse<IApiResponse<IUser[]>> = await getRequest("/users");
  
  if (response.data.success && response.data.data) {
    return response.data.data.map(user => userModel(user));
  }
  
  throw new Error(response.data.message || "Failed to get users");
};

export const getUserByIdService = async (id: number): Promise<IUser> => {
  const response: AxiosResponse<IApiResponse<IUser>> = await getRequest(`/users/${id}`);
  
  if (response.data.success && response.data.data) {
    return userModel(response.data.data);
  }
  
  throw new Error(response.data.message || "Failed to get user");
};

export const updateUserService = async (
  id: number,
  userData: Partial<Pick<IUser, 'email' | 'firstName' | 'lastName' | 'password'>>
): Promise<IUser> => {
  const response: AxiosResponse<IApiResponse<IUser>> = await patchRequest(`/users/${id}`, userData);
  
  if (response.data.success && response.data.data) {
    return userModel(response.data.data);
  }
  
  throw new Error(response.data.message || "Failed to update user");
};

export const deleteUserService = async (id: number): Promise<void> => {
  const response: AxiosResponse<IApiResponse> = await deleteRequest(`/users/${id}`);

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to delete user");
  }
};

export const updateUserPreferencesService = async (visibleSections: IVisibleSections): Promise<IUser> => {
  const response: AxiosResponse<IApiResponse<IUser>> = await patchRequest("/users/me/preferences", { visibleSections });

  if (response.data.success && response.data.data) {
    return userModel(response.data.data);
  }

  throw new Error(response.data.message || "Failed to update preferences");
};

export const uploadAvatarService = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("avatar", file);

  const response: AxiosResponse<IApiResponse<{ avatarUrl: string }>> =
    await postFormDataRequest("/users/me/avatar", formData);

  if (response.data.success && response.data.data) {
    return response.data.data.avatarUrl;
  }

  throw new Error(response.data.message || "Failed to upload avatar");
};

export const deleteAvatarService = async (): Promise<void> => {
  const response: AxiosResponse<IApiResponse> = await deleteRequest("/users/me/avatar");

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to delete avatar");
  }
};

export const deleteMyAccountService = async (): Promise<void> => {
  const response: AxiosResponse<IApiResponse> = await deleteRequest("/users/me");

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to delete account");
  }
};

export const changeMyEmailService = async (newEmail: string, password: string): Promise<IUser> => {
  const response: AxiosResponse<IApiResponse<IUser>> = await patchRequest("/users/me/email", { newEmail, password });

  if (response.data.success && response.data.data) {
    return userModel(response.data.data);
  }

  throw new Error(response.data.message || "Failed to change email");
};

export const changeMyPasswordService = async (currentPassword: string, newPassword: string): Promise<void> => {
  const response: AxiosResponse<IApiResponse> = await patchRequest("/users/me/password", { currentPassword, newPassword });

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to change password");
  }
};
