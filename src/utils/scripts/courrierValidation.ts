import { ICourrierFormData } from "../types/courrier.types";

export interface ValidationResult {
  isValid: boolean;
  errorMessage: string;
}

export const validateCourrierForm = (formData: ICourrierFormData): ValidationResult => {
  if (!formData.fichierJoint) {
    return {
      isValid: false,
      errorMessage: "Veuillez sélectionner un fichier"
    };
  }
  
  if (!formData.customFileName.trim()) {
    return {
      isValid: false,
      errorMessage: "Veuillez saisir un nom de fichier"
    };
  }
  
  return {
    isValid: true,
    errorMessage: ""
  };
};