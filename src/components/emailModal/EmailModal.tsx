// styles
import "./emailModal.scss";

// hooks | libraries
import { ReactElement, useState, useEffect } from "react";
import { MdClose, MdSend, MdEmail, MdSubject, MdMessage } from "react-icons/md";
import { FiUser, FiFileText } from "react-icons/fi";

// components
import Button from "../button/Button.tsx";

// types
import { ICourrier } from "../../utils/types/courrier.types.ts";

interface EmailModalProps {
  isVisible: boolean;
  courrier: ICourrier | null;
  onClose: () => void;
  onSend: (emailData: { to: string; subject: string; message: string }) => Promise<void>;
  isLoading?: boolean;
  bulkMode?: boolean;
  selectedCount?: number;
}

function EmailModal({ 
  isVisible, 
  courrier, 
  onClose, 
  onSend, 
  isLoading = false, 
  bulkMode = false, 
  selectedCount = 1 
}: EmailModalProps): ReactElement {
  
  const getDefaultMessage = (courrier: ICourrier | null, isBulkMode: boolean, count: number): string => {
    if (isBulkMode) {
      return `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
    <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
      <div style="width: 32px; height: 32px; background: #26d0ce; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px;">W</div>
      <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 300;">WhatATool</h1>
    </div>
    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Système de gestion documentaire</p>
  </div>
  
  <!-- Content -->
  <div style="padding: 30px;">
    <h2 style="color: #333; margin: 0 0 20px 0; font-size: 20px; font-weight: 400;">Envoi groupé: ${count} courrier${count > 1 ? 's' : ''}</h2>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">Bonjour,</p>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">Veuillez trouver ci-joints les ${count} courriers sélectionnés.</p>
    
    <div style="background: #f0f8ff; border-left: 4px solid #26d0ce; padding: 20px; border-radius: 6px; margin: 25px 0;">
      <p style="margin: 0; color: #333; font-weight: 500;">📦 Ces documents ont été traités et organisés via WhatATool.</p>
    </div>
  </div>
  
  <!-- Footer -->
  <div style="background: #f8f9fa; padding: 20px; border-top: 1px solid #e9ecef; text-align: center;">
    <p style="color: #adb5bd; font-size: 12px; margin: 0;">
      <em>WhatATool - Votre solution de gestion documentaire</em><br>
      <span style="font-size: 10px; color: #868e96;">© DECRESSAC Nicolas @2025</span>
    </p>
  </div>
</div>`;
    }
    
    if (!courrier) return "";
    
    return `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
    <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
      <div style="width: 32px; height: 32px; background: #26d0ce; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px;">W</div>
      <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 300;">WhatATool</h1>
    </div>
    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Système de gestion documentaire</p>
  </div>
  
  <!-- Content -->
  <div style="padding: 30px;">
    <h2 style="color: #333; margin: 0 0 20px 0; font-size: 20px; font-weight: 400;">Courrier: ${courrier.fileName}</h2>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">Bonjour,</p>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">Veuillez trouver ci-joint le courrier demandé.</p>
    
    <!-- Details Card -->
    <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; border-radius: 6px; margin: 25px 0;">
      <h3 style="margin: 0 0 15px 0; color: #495057; font-size: 16px; font-weight: 500;">📋 Détails du courrier</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color: #666; width: 120px;"><strong>Type:</strong></td><td style="padding: 8px 0; color: #333;">${courrier.kind || 'Non spécifié'}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;"><strong>Département:</strong></td><td style="padding: 8px 0; color: #333;">${courrier.department || 'Non spécifié'}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;"><strong>Direction:</strong></td><td style="padding: 8px 0; color: #333;"><span style="background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 12px; font-size: 12px;">${courrier.direction}</span></td></tr>
        <tr><td style="padding: 8px 0; color: #666;"><strong>Émetteur:</strong></td><td style="padding: 8px 0; color: #333;">${courrier.emitter || 'Non spécifié'}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;"><strong>Destinataire:</strong></td><td style="padding: 8px 0; color: #333;">${courrier.recipient || 'Non spécifié'}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;"><strong>Date de réception:</strong></td><td style="padding: 8px 0; color: #333;">${courrier.receptionDate ? new Date(courrier.receptionDate).toLocaleDateString('fr-FR') : (courrier.created_at ? new Date(courrier.created_at).toLocaleDateString('fr-FR') : 'Non spécifiée')}</td></tr>
      </table>
    </div>
  </div>
  
  <!-- Footer -->
  <div style="background: #f8f9fa; padding: 20px; border-top: 1px solid #e9ecef; text-align: center;">
    <p style="color: #adb5bd; font-size: 12px; margin: 0;">
      <em>WhatATool - Votre solution de gestion documentaire</em><br>
      <span style="font-size: 10px; color: #868e96;">© DECRESSAC Nicolas @2025</span>
    </p>
  </div>
</div>`;
  };

  const getDefaultSubject = (courrier: ICourrier | null, isBulkMode: boolean, count: number): string => {
    if (isBulkMode) {
      return `Envoi groupé: ${count} courrier${count > 1 ? 's' : ''}`;
    }
    return courrier ? `Courrier: ${courrier.fileName}` : "";
  };

  const [formData, setFormData] = useState({
    to: "",
    subject: getDefaultSubject(courrier, bulkMode, selectedCount),
    message: getDefaultMessage(courrier, bulkMode, selectedCount)
  });
  const [error, setError] = useState<string>("");

  // Update form data when courrier changes
  useEffect(() => {
    if (isVisible) {
      setFormData({
        to: "",
        subject: getDefaultSubject(courrier, bulkMode, selectedCount),
        message: getDefaultMessage(courrier, bulkMode, selectedCount)
      });
    }
  }, [isVisible, courrier, bulkMode, selectedCount]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError("");
  };

  const validateEmail = (email: string): boolean => {
    // Regex plus robuste pour la validation d'email
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    // Vérifications supplémentaires
    if (email.length > 254) return false; // Longueur maximale d'un email
    if (email.includes('..')) return false; // Pas de points consécutifs
    if (email.startsWith('.') || email.endsWith('.')) return false; // Pas de point au début ou à la fin
    
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset les erreurs précédentes
    setError("");
    
    // Validation renforcée
    if (!formData.to.trim()) {
      setError("L'adresse email du destinataire est requise");
      return;
    }
    
    if (!validateEmail(formData.to.trim())) {
      setError("L'adresse email n'est pas valide. Veuillez vérifier le format (ex: nom@domaine.com)");
      return;
    }
    
    if (!formData.subject.trim()) {
      setError("Le sujet est requis");
      return;
    }
    
    if (formData.subject.trim().length > 200) {
      setError("Le sujet ne peut pas dépasser 200 caractères");
      return;
    }
    
    // Validation pour le mode bulk
    if (bulkMode && selectedCount === 0) {
      setError("Aucun courrier sélectionné pour l'envoi groupé");
      return;
    }
    
    // Validation pour le mode simple
    if (!bulkMode && !courrier) {
      setError("Aucun courrier à envoyer");
      return;
    }
    
    try {
      await onSend({
        to: formData.to.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim() || ""
      });
      
      // Reset form and close modal on success
      setFormData({
        to: "",
        subject: getDefaultSubject(courrier, bulkMode, selectedCount),
        message: getDefaultMessage(courrier, bulkMode, selectedCount)
      });
      setError("");
      onClose();
    } catch (error: unknown) {
      // Gestion d'erreur locale dans le modal ET propagation au parent
      let errorMessage = "Erreur lors de l'envoi de l'email";
      
      if (error instanceof Error) {
        // Gestion spécifique des erreurs réseau et timeout
        if (error.name === 'NetworkError' || error.message.includes('fetch')) {
          errorMessage = "Erreur de connexion. Vérifiez votre connexion internet et réessayez.";
        } else if (error.message.includes('timeout')) {
          errorMessage = "L'envoi a pris trop de temps. Réessayez dans quelques instants.";
        } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
          errorMessage = "Session expirée. Veuillez vous reconnecter.";
        } else if (error.message.includes('403') || error.message.includes('forbidden')) {
          errorMessage = "Vous n'avez pas l'autorisation d'envoyer cet email.";
        } else if (error.message.includes('404')) {
          errorMessage = "Courrier non trouvé ou supprimé.";
        } else if (error.message.includes('413') || error.message.includes('too large')) {
          errorMessage = "Le courrier est trop volumineux pour être envoyé par email.";
        } else if (error.message.includes('503') || error.message.includes('email non configuré')) {
          errorMessage = "Service email temporairement indisponible. Contactez l'administrateur.";
        } else {
          errorMessage = error.message;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Afficher l'erreur dans le modal pour que l'utilisateur la voie
      setError(errorMessage);
      
      // Propager l'erreur au composant parent pour les notifications globales
      throw error;
    }
  };

  const handleClose = () => {
    setFormData({
      to: "",
      subject: getDefaultSubject(courrier, bulkMode, selectedCount),
      message: getDefaultMessage(courrier, bulkMode, selectedCount)
    });
    setError("");
    onClose();
  };

  if (!isVisible) return <></>;

  return (
    <div id="emailModal">
      <div className="emailModalOverlay" onClick={handleClose}>
        <div className="emailModalContent" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <header className="emailModalHeader">
            <div className="modalTitle">
              <MdEmail className="titleIcon" />
              <h2>{bulkMode ? `Envoi groupé (${selectedCount} courrier${selectedCount > 1 ? 's' : ''})` : 'Envoyer par email'}</h2>
            </div>
            <button className="closeBtn" onClick={handleClose} type="button">
              <MdClose />
            </button>
          </header>

          {/* Courrier Info */}
          {bulkMode ? (
            <div className="bulkCourrierInfo">
              <FiFileText className="courrierIcon" />
              <div className="bulkDetails">
                <h3>Envoi groupé de {selectedCount} courrier{selectedCount > 1 ? 's' : ''}</h3>
                <p className="bulkDescription">
                  Les courriers sélectionnés seront envoyés en pièces jointes dans un seul email.
                </p>
              </div>
            </div>
          ) : (
            courrier && (
              <div className="courrierInfo">
                <FiFileText className="courrierIcon" />
                <div className="courrierDetails">
                  <span className="fileName">{courrier.fileName}</span>
                  <span className="fileInfo">
                    {courrier.kind} • {courrier.department} • {courrier.direction}
                  </span>
                </div>
              </div>
            )
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="emailForm">
            {/* Recipient */}
            <div className="formGroup">
              <label htmlFor="emailTo" className="formLabel">
                <FiUser className="labelIcon" />
                Destinataire *
              </label>
              <input
                id="emailTo"
                type="email"
                placeholder="exemple@domaine.com"
                value={formData.to}
                onChange={(e) => handleInputChange('to', e.target.value)}
                className="formInput"
                required
              />
            </div>

            {/* Subject */}
            <div className="formGroup">
              <label htmlFor="emailSubject" className="formLabel">
                <MdSubject className="labelIcon" />
                Sujet *
              </label>
              <input
                id="emailSubject"
                type="text"
                placeholder="Objet de l'email"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="formInput"
                required
              />
            </div>

            {/* Message */}
            <div className="formGroup">
              <label htmlFor="emailMessage" className="formLabel">
                <MdMessage className="labelIcon" />
                Message personnalisé
              </label>
              <textarea
                id="emailMessage"
                placeholder="Modifier ce message ou laisser tel quel..."
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className="formTextarea"
                rows={4}
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="errorMessage">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="formActions">
              <Button
                type="button"
                style="grey"
                onClick={handleClose}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                style="green"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loadingSpinner" />
                    {bulkMode ? 'Envoi groupé en cours...' : 'Envoi...'}
                  </>
                ) : (
                  <>
                    {bulkMode ? `Envoyer ${selectedCount} courrier${selectedCount > 1 ? 's' : ''}` : 'Envoyer'}
                    <MdSend fill="#ffffff" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Info Note */}
          <div className="infoNote">
            <span className="infoIcon">ℹ️</span>
            <p>
              {bulkMode 
                ? `Les ${selectedCount} courriers seront envoyés en pièces jointes dans un seul email.`
                : "Le courrier sera envoyé en pièce jointe. Un email avec les détails du document sera automatiquement généré si aucun message personnalisé n'est fourni."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailModal;