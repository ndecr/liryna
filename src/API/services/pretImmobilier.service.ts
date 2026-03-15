import { getRequest, postRequest } from "../APICalls.ts";
import { AxiosResponse } from "axios";
import {
  IPretImmobilier,
  IPretImmobilierFormData,
  IGeoCommune,
  IDvfPriceData
} from "../../utils/types/pretImmobilier.types.ts";

interface IApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export const getSimulationService = async (): Promise<IPretImmobilier> => {
  const response: AxiosResponse<IApiResponse<IPretImmobilier>> =
    await getRequest("/pret-immobilier");

  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.message || "Aucune simulation trouvee");
};

export const upsertSimulationService = async (
  formData: Partial<IPretImmobilierFormData>
): Promise<IPretImmobilier> => {
  const response: AxiosResponse<IApiResponse<IPretImmobilier>> =
    await postRequest("/pret-immobilier", formData);

  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.message || "Erreur lors de la sauvegarde");
};

export const searchCommunesService = async (q: string): Promise<IGeoCommune[]> => {
  const response: AxiosResponse<IApiResponse<IGeoCommune[]>> =
    await getRequest(`/pret-immobilier/search?q=${encodeURIComponent(q)}`);

  return response.data.data || [];
};

export const getCommunesInRadiusService = async (
  lat: number,
  lon: number,
  radius: number
): Promise<IGeoCommune[]> => {
  const response: AxiosResponse<IApiResponse<IGeoCommune[]>> =
    await getRequest(`/pret-immobilier/communes?lat=${lat}&lon=${lon}&radius=${radius}`);

  return response.data.data || [];
};

export const getDvfPricesService = async (insee: string): Promise<IDvfPriceData> => {
  const response: AxiosResponse<IApiResponse<IDvfPriceData>> =
    await getRequest(`/pret-immobilier/prices/${insee}`);

  return response.data.data || { avgPricePerM2: null, transactionCount: 0 };
};
