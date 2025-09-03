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

  if (!formData.kind.trim()) {
    return {
      isValid: false,
      errorMessage: "Veuillez saisir le type de courrier"
    };
  }

  if (!formData.department.trim()) {
    return {
      isValid: false,
      errorMessage: "Veuillez saisir le service/département"
    };
  }

  if (!formData.direction) {
    return {
      isValid: false,
      errorMessage: "Veuillez sélectionner la direction"
    };
  }
  
  return {
    isValid: true,
    errorMessage: ""
  };
};