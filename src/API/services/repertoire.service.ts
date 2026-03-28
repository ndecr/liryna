import { AxiosResponse } from "axios";
import { getRequest, postRequest, patchRequest, deleteRequest } from "../APICalls.ts";
import {
  IRepertoireTrack,
  IRepertoireTrackFormData,
} from "../../utils/types/musique.types.ts";
import { repertoireTrackModel } from "../models/repertoire.model.ts";

interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export const getRepertoireService = async (): Promise<IRepertoireTrack[]> => {
  const response: AxiosResponse<IApiResponse<IRepertoireTrack[]>> =
    await getRequest("/repertoire");
  if (response.data.success && response.data.data) {
    return response.data.data.map(repertoireTrackModel);
  }
  throw new Error(response.data.message || "Erreur lors de la récupération du répertoire");
};

export const createRepertoireTrackService = async (
  formData: IRepertoireTrackFormData
): Promise<IRepertoireTrack> => {
  const response: AxiosResponse<IApiResponse<IRepertoireTrack>> =
    await postRequest("/repertoire", formData);
  if (response.data.success && response.data.data) {
    return repertoireTrackModel(response.data.data);
  }
  throw new Error(response.data.message || "Erreur lors de la création");
};

export const updateRepertoireTrackService = async (
  id: number,
  formData: Partial<IRepertoireTrackFormData>
): Promise<IRepertoireTrack> => {
  const response: AxiosResponse<IApiResponse<IRepertoireTrack>> =
    await patchRequest(`/repertoire/${id}`, formData);
  if (response.data.success && response.data.data) {
    return repertoireTrackModel(response.data.data);
  }
  throw new Error(response.data.message || "Erreur lors de la mise à jour");
};

export const toggleRepertoireTrackMasteredService = async (
  id: number,
  isMastered: boolean
): Promise<IRepertoireTrack> => {
  const response: AxiosResponse<IApiResponse<IRepertoireTrack>> =
    await patchRequest(`/repertoire/${id}`, { isMastered });
  if (response.data.success && response.data.data) {
    return repertoireTrackModel(response.data.data);
  }
  throw new Error(response.data.message || "Erreur lors de la mise à jour");
};

export const deleteRepertoireTrackService = async (id: number): Promise<void> => {
  const response: AxiosResponse<IApiResponse> =
    await deleteRequest(`/repertoire/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.message || "Erreur lors de la suppression");
  }
};
