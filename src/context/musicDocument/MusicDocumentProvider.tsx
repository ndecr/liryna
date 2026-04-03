import { useState, useMemo, useCallback, ReactElement } from "react";
import { MusicDocumentContext } from "./MusicDocumentContext.tsx";
import {
  IMusicDocument,
  IMusicDocumentUploadData,
  IMusicDocumentUpdateData,
  IMusicDocumentSearchParams,
  IPagination,
  IMusicDocumentStats,
  IMusicDocumentListParams
} from "../../utils/types/musicDocument.types.ts";
import {
  uploadMusicDocumentService,
  getAllMusicDocumentsService,
  getMusicDocumentByIdService,
  updateMusicDocumentService,
  deleteMusicDocumentService,
  searchMusicDocumentsService,
  downloadMusicDocumentService,
  toggleFavoriteService,
  getMusicDocumentStatsService
} from "../../API/services/musicDocument.service.ts";

export const MusicDocumentProvider = ({
  children,
}: {
  children: ReactElement;
}): ReactElement => {
  const [documents, setDocuments] = useState<IMusicDocument[]>([]);
  const [currentDocument, setCurrentDocument] = useState<IMusicDocument | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<IPagination | null>(null);
  const [stats, setStats] = useState<IMusicDocumentStats | null>(null);

  const uploadDocument = useCallback(async (file: File, metadata: IMusicDocumentUploadData): Promise<IMusicDocument> => {
    setIsLoading(true);
    try {
      const newDocument = await uploadMusicDocumentService(file, metadata);
      setDocuments(prev => [newDocument, ...prev]);
      return newDocument;
    } catch (error) {
      console.error("Error while uploading music document:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAllDocuments = useCallback(async (params: IMusicDocumentListParams = {}): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await getAllMusicDocumentsService(params);
      setDocuments(response.documents);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error while getting music documents:", error);
      setDocuments([]);
      setPagination(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getDocumentById = useCallback(async (id: number): Promise<void> => {
    setIsLoading(true);
    try {
      const document = await getMusicDocumentByIdService(id);
      setCurrentDocument(document);
    } catch (error) {
      console.error("Error while getting music document:", error);
      setCurrentDocument(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateDocument = useCallback(async (id: number, metadata: IMusicDocumentUpdateData): Promise<IMusicDocument> => {
    setIsLoading(true);
    try {
      const updatedDocument = await updateMusicDocumentService(id, metadata);
      setDocuments(prev => prev.map(doc => doc.id === id ? updatedDocument : doc));
      setCurrentDocument(prev => prev?.id === id ? updatedDocument : prev);
      return updatedDocument;
    } catch (error) {
      console.error("Error while updating music document:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteDocument = useCallback(async (id: number): Promise<void> => {
    setIsLoading(true);
    try {
      await deleteMusicDocumentService(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      setCurrentDocument(prev => prev?.id === id ? null : prev);
    } catch (error) {
      console.error("Error while deleting music document:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchDocuments = useCallback(async (params: IMusicDocumentSearchParams): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await searchMusicDocumentsService(params);
      setDocuments(response.documents);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error while searching music documents:", error);
      setDocuments([]);
      setPagination(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const downloadDocument = useCallback(async (id: number): Promise<Blob> => {
    setIsLoading(true);
    try {
      const blob = await downloadMusicDocumentService(id);
      return blob;
    } catch (error) {
      console.error("Error while downloading music document:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleFavorite = useCallback(async (id: number): Promise<IMusicDocument> => {
    setIsLoading(true);
    try {
      const updatedDocument = await toggleFavoriteService(id);
      setDocuments(prev => prev.map(doc => doc.id === id ? updatedDocument : doc));
      setCurrentDocument(prev => prev?.id === id ? updatedDocument : prev);
      return updatedDocument;
    } catch (error) {
      console.error("Error while toggling favorite:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStats = useCallback(async (): Promise<void> => {
    try {
      const statsData = await getMusicDocumentStatsService();
      setStats(statsData);
    } catch (error) {
      console.error("Error while getting music document stats:", error);
      setStats(null);
      throw error;
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      documents,
      currentDocument,
      isLoading,
      pagination,
      stats,
      setDocuments,
      setCurrentDocument,
      uploadDocument,
      getAllDocuments,
      getDocumentById,
      updateDocument,
      deleteDocument,
      searchDocuments,
      downloadDocument,
      toggleFavorite,
      getStats,
    }),
    [documents, currentDocument, isLoading, pagination, stats, uploadDocument, getAllDocuments, getDocumentById, updateDocument, deleteDocument, searchDocuments, downloadDocument, toggleFavorite, getStats],
  );

  return (
    <MusicDocumentContext.Provider value={contextValue}>
      {children}
    </MusicDocumentContext.Provider>
  );
};
