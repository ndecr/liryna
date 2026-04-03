import { getRequest, postFormDataRequest, patchRequest, deleteRequest } from "../APICalls.ts";
import { AxiosResponse } from "axios";
import {
  IMusicDocument,
  IMusicDocumentUploadData,
  IMusicDocumentUpdateData,
  IApiResponse,
  IMusicDocumentSearchParams,
  IPagination,
  IMusicDocumentStats,
  IMusicDocumentListParams
} from "../../utils/types/musicDocument.types.ts";

export const uploadMusicDocumentService = async (
  file: File,
  metadata: IMusicDocumentUploadData
): Promise<IMusicDocument> => {
  const formData = new FormData();
  formData.append('document', file);
  
  Object.entries(metadata).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      formData.append(key, value);
    }
  });

  const response: AxiosResponse<IApiResponse<IMusicDocument>> = await postFormDataRequest("/music-documents/upload", formData);
  
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || "Failed to upload music document");
};

export const getAllMusicDocumentsService = async (
  params: IMusicDocumentListParams = {}
): Promise<{ documents: IMusicDocument[], pagination: IPagination | null }> => {
  const { page = 1, limit = 10, sortBy, sortOrder, filterType, filterFavorite } = params;
  const queryParams = new URLSearchParams();
  queryParams.set('page', String(page));
  queryParams.set('limit', String(limit));
  if (sortBy) queryParams.set('sortBy', sortBy);
  if (sortOrder) queryParams.set('sortOrder', sortOrder);
  if (filterType) queryParams.set('filterType', filterType);
  if (filterFavorite !== undefined) queryParams.set('filterFavorite', String(filterFavorite));
  
  const response: AxiosResponse<IApiResponse<IMusicDocument[]>> = await getRequest(`/music-documents?${queryParams.toString()}`);
  
  if (response.data.success && response.data.data) {
    return {
      documents: response.data.data,
      pagination: response.data.pagination || null
    };
  }
  
  throw new Error(response.data.message || "Failed to get music documents");
};

export const getMusicDocumentByIdService = async (id: number): Promise<IMusicDocument> => {
  const response: AxiosResponse<IApiResponse<IMusicDocument>> = await getRequest(`/music-documents/${id}`);
  
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || "Failed to get music document");
};

export const updateMusicDocumentService = async (
  id: number,
  metadata: IMusicDocumentUpdateData
): Promise<IMusicDocument> => {
  const response: AxiosResponse<IApiResponse<IMusicDocument>> = await patchRequest(`/music-documents/${id}`, metadata);
  
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || "Failed to update music document");
};

export const deleteMusicDocumentService = async (id: number): Promise<void> => {
  const response: AxiosResponse<IApiResponse> = await deleteRequest(`/music-documents/${id}`);
  
  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to delete music document");
  }
};

export const searchMusicDocumentsService = async (
  params: IMusicDocumentSearchParams
): Promise<{ documents: IMusicDocument[], pagination: IPagination | null }> => {
  const { query, page = 1, limit = 10 } = params;
  const queryParams = new URLSearchParams();
  queryParams.set('query', query);
  queryParams.set('page', String(page));
  queryParams.set('limit', String(limit));
  
  const response: AxiosResponse<IApiResponse<IMusicDocument[]>> = await getRequest(`/music-documents/search?${queryParams.toString()}`);
  
  if (response.data.success && response.data.data) {
    return {
      documents: response.data.data,
      pagination: response.data.pagination || null
    };
  }
  
  throw new Error(response.data.message || "Failed to search music documents");
};

export const downloadMusicDocumentService = async (id: number): Promise<Blob> => {
  const response = await getRequest(`/music-documents/${id}/download`, { responseType: 'blob' });
  return response.data;
};

export const toggleFavoriteService = async (id: number): Promise<IMusicDocument> => {
  const response: AxiosResponse<IApiResponse<IMusicDocument>> = await patchRequest(`/music-documents/${id}/favorite`, {});
  
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || "Failed to toggle favorite");
};

export const getMusicDocumentStatsService = async (): Promise<IMusicDocumentStats> => {
  const response: AxiosResponse<IApiResponse<IMusicDocumentStats>> = await getRequest("/music-documents/stats");
  
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || "Failed to get music document stats");
};
