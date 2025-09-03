interface AxiosError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
}

export const handleCourrierUploadError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response?.status === 400) {
      return `Erreur de validation: ${axiosError.response.data?.message || "Données invalides"}`;
    } else if (axiosError.response?.status === 413) {
      return "Le fichier est trop volumineux (max 50MB)";
    } else if (axiosError.response?.data?.message) {
      return `Erreur: ${axiosError.response.data.message}`;
    }
  }
  
  return "Erreur lors de la création du courrier. Veuillez réessayer.";
};