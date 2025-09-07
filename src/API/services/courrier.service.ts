import { getRequest, postRequest, postFormDataRequest, patchRequest, deleteRequest } from "../APICalls.ts";
import { AxiosResponse } from "axios";
import axios from "axios";
import { ICourrier, ICourrierUploadData, IApiResponse, ICourrierSearchParams, IPagination, ICourrierStats } from "../../utils/types/courrier.types.ts";
import { courrierModel } from "../models/courrier.model.ts";

export const uploadCourrierService = async (
  file: File, 
  metadata: ICourrierUploadData
): Promise<ICourrier> => {
  const formData = new FormData();
  formData.append('courrier', file);
  
  Object.entries(metadata).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      formData.append(key, value);
    }
  });


  const response: AxiosResponse<IApiResponse<ICourrier>> = await postFormDataRequest("/courriers/upload", formData);
  
  if (response.data.success && response.data.data) {
    return courrierModel(response.data.data);
  }
  
  throw new Error(response.data.message || "Failed to upload courrier");
};

export const getAllCourriersService = async (
  page: number = 1, 
  limit: number = 10
): Promise<{ courriers: ICourrier[], pagination: IPagination | null }> => {
  const response: AxiosResponse<IApiResponse<ICourrier[]>> = await getRequest(`/courriers?page=${page}&limit=${limit}`);
  
  if (response.data.success && response.data.data) {
    return {
      courriers: response.data.data.map(courrier => courrierModel(courrier)),
      pagination: response.data.pagination || null
    };
  }
  
  throw new Error(response.data.message || "Failed to get courriers");
};

export const getCourrierByIdService = async (id: number): Promise<ICourrier> => {
  const response: AxiosResponse<IApiResponse<ICourrier>> = await getRequest(`/courriers/${id}`);
  
  if (response.data.success && response.data.data) {
    return courrierModel(response.data.data);
  }
  
  throw new Error(response.data.message || "Failed to get courrier");
};

export const updateCourrierService = async (
  id: number,
  metadata: Partial<ICourrierUploadData>
): Promise<ICourrier> => {
  const response: AxiosResponse<IApiResponse<ICourrier>> = await patchRequest(`/courriers/${id}`, metadata);
  
  if (response.data.success && response.data.data) {
    return courrierModel(response.data.data);
  }
  
  throw new Error(response.data.message || "Failed to update courrier");
};

export const deleteCourrierService = async (id: number): Promise<void> => {
  const response: AxiosResponse<IApiResponse> = await deleteRequest(`/courriers/${id}`);
  
  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to delete courrier");
  }
};

export const searchCourriersService = async (params: ICourrierSearchParams): Promise<{ courriers: ICourrier[], pagination: IPagination | null }> => {
  let url = '/courriers/search/';
  const queryParams = new URLSearchParams();

  if (params.column && params.value) {
    url += `column?column=${params.column}&value=${params.value}`;
  } else if (params.query) {
    url += `global?query=${params.query}`;
  } else {
    throw new Error("Either column/value or query parameter is required");
  }

  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  
  if (queryParams.toString()) {
    url += (url.includes('?') ? '&' : '?') + queryParams.toString();
  }

  const response: AxiosResponse<IApiResponse<ICourrier[]>> = await getRequest(url);
  
  if (response.data.success && response.data.data) {
    return {
      courriers: response.data.data.map(courrier => courrierModel(courrier)),
      pagination: response.data.pagination || null
    };
  }
  
  throw new Error(response.data.message || "Failed to search courriers");
};

export const downloadCourrierService = async (id: number): Promise<Blob> => {
  const response = await getRequest(`/courriers/${id}/download`, { responseType: 'blob' });
  return response.data;
};

export const sendCourrierEmailService = async (
  id: number, 
  emailData: { to: string; subject: string; message: string }
): Promise<void> => {
  const response: AxiosResponse<IApiResponse> = await postRequest(`/courriers/${id}/send-email`, emailData);
  
  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to send courrier email");
  }
};

export const getCourrierStatsService = async (): Promise<ICourrierStats> => {
  const response: AxiosResponse<IApiResponse<ICourrierStats>> = await getRequest("/courriers/stats");
  
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || "Failed to get courrier stats");
};

export const getCourrierFieldOptionsService = async (field: 'kind' | 'department' | 'emitter' | 'recipient'): Promise<string[]> => {
  const response: AxiosResponse<IApiResponse<{ field: string; options: string[] }>> = await getRequest(`/courriers/field-options/${field}`);
  
  if (response.data.success && response.data.data) {
    return response.data.data.options;
  }
  
  throw new Error(response.data.message || "Failed to get field options");
};

export const downloadBulkCourriersService = async (courrierIds: number[]): Promise<Blob> => {
  // Utiliser axios directement pour les téléchargements POST avec responseType blob
  // Les cookies httpOnly sont automatiquement envoyés avec withCredentials: true
  const config = {
    headers: {
      'Content-Type': 'application/json'
    },
    responseType: 'blob' as const,
    withCredentials: true // Assurer que les cookies sont envoyés
  };
  
  const response = await axios.post(`/courriers/download-bulk`, { courrierIds }, config);
  return response.data;
};

export const sendBulkCourrierEmailService = async (
  courrierIds: number[],
  emailData: { to: string; subject: string; message: string }
): Promise<{ courriersCount: number; messageId: string }> => {
  const response: AxiosResponse<IApiResponse<{ courriersCount: number; messageId: string }>> = await postRequest(`/courriers/send-bulk-email`, {
    courrierIds,
    ...emailData
  });
  
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || "Failed to send bulk courrier email");
};