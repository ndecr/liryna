export type MusicDocumentType = 'partition' | 'grille_accords' | 'tab' | 'paroles' | 'theorie' | 'autre';

export interface IMusicDocument {
  id: number;
  userId: number;
  title: string;
  type: MusicDocumentType;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  isFavorite: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface IMusicDocumentUploadData {
  title: string;
  type: MusicDocumentType;
  customFileName?: string;
  description?: string;
}

export interface IMusicDocumentUpdateData {
  title?: string;
  type?: MusicDocumentType;
  description?: string;
  isFavorite?: boolean;
}

export interface IPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: IPagination;
}

export interface IMusicDocumentSearchParams {
  query: string;
  page?: number;
  limit?: number;
}

export interface IMusicDocumentStats {
  total: number;
  favorites: number;
  byType: {
    partition: number;
    grille_accords: number;
    tab: number;
    paroles: number;
    theorie: number;
    autre: number;
  };
}

export type MusicDocumentSortColumn = 'title' | 'type' | 'fileName' | 'fileSize' | 'isFavorite' | 'created_at';

export type SortOrder = 'ASC' | 'DESC';

export interface IMusicDocumentListParams {
  page?: number;
  limit?: number;
  sortBy?: MusicDocumentSortColumn;
  sortOrder?: SortOrder;
  filterType?: MusicDocumentType;
  filterFavorite?: boolean;
}

export interface IMusicDocumentViewUrlResponse {
  viewUrl: string;
  expiresIn: number;
  expiresAt: string;
  documentId: number;
  userId: number;
}
