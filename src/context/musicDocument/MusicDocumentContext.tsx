import {
  IMusicDocument,
  IMusicDocumentUploadData,
  IMusicDocumentUpdateData,
  IMusicDocumentSearchParams,
  IPagination,
  IMusicDocumentStats,
  IMusicDocumentListParams
} from "../../utils/types/musicDocument.types.ts";
import { createContext, Context } from "react";

interface IMusicDocumentContext {
  documents: IMusicDocument[];
  currentDocument: IMusicDocument | null;
  isLoading: boolean;
  pagination: IPagination | null;
  stats: IMusicDocumentStats | null;
  setDocuments: (documents: IMusicDocument[]) => void;
  setCurrentDocument: (document: IMusicDocument | null) => void;
  uploadDocument: (file: File, metadata: IMusicDocumentUploadData) => Promise<IMusicDocument>;
  getAllDocuments: (params?: IMusicDocumentListParams) => Promise<void>;
  getDocumentById: (id: number) => Promise<void>;
  updateDocument: (id: number, metadata: IMusicDocumentUpdateData) => Promise<IMusicDocument>;
  deleteDocument: (id: number) => Promise<void>;
  searchDocuments: (params: IMusicDocumentSearchParams) => Promise<void>;
  downloadDocument: (id: number) => Promise<Blob>;
  toggleFavorite: (id: number) => Promise<IMusicDocument>;
  getStats: () => Promise<void>;
}

export const MusicDocumentContext: Context<IMusicDocumentContext> = createContext<IMusicDocumentContext>({
  documents: [],
  currentDocument: null,
  isLoading: false,
  pagination: null,
  stats: null,
  setDocuments: (): void => {},
  setCurrentDocument: (): void => {},
  uploadDocument: async (): Promise<IMusicDocument> => { throw new Error("Context not initialized"); },
  getAllDocuments: async (): Promise<void> => {},
  getDocumentById: async (): Promise<void> => {},
  updateDocument: async (): Promise<IMusicDocument> => { throw new Error("Context not initialized"); },
  deleteDocument: async (): Promise<void> => {},
  searchDocuments: async (): Promise<void> => {},
  downloadDocument: async (): Promise<Blob> => { throw new Error("Context not initialized"); },
  toggleFavorite: async (): Promise<IMusicDocument> => { throw new Error("Context not initialized"); },
  getStats: async (): Promise<void> => {},
});
