import axios from "axios";

export const handleAuthError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 409) {
      return "Un compte avec cet email existe déjà. Vous pouvez vous connecter avec cet email.";
    } else if (error.response?.status === 401) {
      return "Identifiants invalides. Veuillez vérifier votre email et mot de passe.";
    } else if (error.response?.data?.message) {
      return error.response.data.message;
    } else {
      return "Erreur de connexion. Veuillez réessayer.";
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return "Une erreur inattendue s'est produite.";
};

export const handleRegistrationError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;
    
    if (error.response?.status === 409) {
      return "Un compte avec cet email existe déjà. Vous pouvez vous connecter avec cet email.";
    }
    
    // Gestion des erreurs de validation détaillées
    if (responseData?.errors && Array.isArray(responseData.errors)) {
      const errorMessages = responseData.errors.map((err: { message: string; value?: string }) => {
        return err.message;
      });
      return errorMessages.join('\n');
    }
    
    // Message général si pas d'erreurs détaillées
    if (responseData?.message) {
      return responseData.message;
    }
    
    return "Erreur lors de l'inscription. Veuillez réessayer.";
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return "Erreur lors de l'inscription. Veuillez réessayer.";
};