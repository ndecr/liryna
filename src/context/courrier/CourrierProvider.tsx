import { useState, useMemo, ReactElement } from "react";
import { CourrierContext } from "./CourrierContext.tsx";
import { ICourrier, ICourrierUploadData, ICourrierSearchParams } from "../../utils/types/courrier.types.ts";
import {
  uploadCourrierService,
  getAllCourriersService,
  getCourrierByIdService,
  updateCourrierService,
  deleteCourrierService,
  searchCourriersService,
  downloadCourrierService,
  sendCourrierEmailService
} from "../../API/services/courrier.service.ts";

export const CourrierProvider = ({
  children,
}: {
  children: ReactElement;
}): ReactElement => {
  const [courriers, setCourriers] = useState<ICourrier[]>([]);
  const [currentCourrier, setCurrentCourrier] = useState<ICourrier | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);

  const uploadCourrier = async (file: File, metadata: ICourrierUploadData): Promise<ICourrier> => {
    setIsLoading(true);
    try {
      const newCourrier = await uploadCourrierService(file, metadata);
      setCourriers(prev => [newCourrier, ...prev]);
      return newCourrier;
    } catch (error) {
      console.error("Error while uploading courrier:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getAllCourriers = async (page: number = 1, limit: number = 10): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await getAllCourriersService(page, limit);
      setCourriers(response.courriers);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error while getting courriers:", error);
      setCourriers([]);
      setPagination(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getCourrierById = async (id: number): Promise<void> => {
    setIsLoading(true);
    try {
      const courrier = await getCourrierByIdService(id);
      setCurrentCourrier(courrier);
    } catch (error) {
      console.error("Error while getting courrier:", error);
      setCurrentCourrier(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCourrier = async (id: number, metadata: Partial<ICourrierUploadData>): Promise<ICourrier> => {
    setIsLoading(true);
    try {
      const updatedCourrier = await updateCourrierService(id, metadata);
      
      setCourriers(prev => 
        prev.map(courrier => 
          courrier.id === id ? updatedCourrier : courrier
        )
      );
      
      if (currentCourrier?.id === id) {
        setCurrentCourrier(updatedCourrier);
      }
      
      return updatedCourrier;
    } catch (error) {
      console.error("Error while updating courrier:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCourrier = async (id: number): Promise<void> => {
    setIsLoading(true);
    try {
      await deleteCourrierService(id);
      
      setCourriers(prev => prev.filter(courrier => courrier.id !== id));
      
      if (currentCourrier?.id === id) {
        setCurrentCourrier(null);
      }
    } catch (error) {
      console.error("Error while deleting courrier:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const searchCourriers = async (params: ICourrierSearchParams): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await searchCourriersService(params);
      setCourriers(response.courriers);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error while searching courriers:", error);
      setCourriers([]);
      setPagination(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCourrier = async (id: number): Promise<Blob> => {
    setIsLoading(true);
    try {
      return await downloadCourrierService(id);
    } catch (error) {
      console.error("Error while downloading courrier:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendCourrierEmail = async (
    id: number, 
    emailData: { to: string; subject: string; message: string }
  ): Promise<void> => {
    setIsLoading(true);
    try {
      await sendCourrierEmailService(id, emailData);
    } catch (error) {
      console.error("Error while sending courrier email:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue = useMemo(
    () => ({
      courriers,
      currentCourrier,
      isLoading,
      pagination,
      setCourriers,
      setCurrentCourrier,
      uploadCourrier,
      getAllCourriers,
      getCourrierById,
      updateCourrier,
      deleteCourrier,
      searchCourriers,
      downloadCourrier,
      sendCourrierEmail,
    }),
    [courriers, currentCourrier, isLoading, pagination],
  );

  return (
    <CourrierContext.Provider value={contextValue}>
      {children}
    </CourrierContext.Provider>
  );
};