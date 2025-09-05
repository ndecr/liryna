// styles
import "./emailModal.scss";

// hooks | libraries
import { ReactElement, useState } from "react";
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
}

function EmailModal({ isVisible, courrier, onClose, onSend, isLoading = false }: EmailModalProps): ReactElement {
  const [formData, setFormData] = useState({
    to: "",
    subject: courrier ? `Courrier: ${courrier.fileName}` : "",
    message: ""
  });
  const [error, setError] = useState<string>("");

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError("");
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.to.trim()) {
      setError("L'adresse email du destinataire est requise");
      return;
    }
    
    if (!validateEmail(formData.to.trim())) {
      setError("L'adresse email n'est pas valide");
      return;
    }
    
    if (!formData.subject.trim()) {
      setError("Le sujet est requis");
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
        subject: courrier ? `Courrier: ${courrier.fileName}` : "",
        message: ""
      });
      setError("");
      onClose();
    } catch (error) {
      // Error will be handled by parent component
    }
  };

  const handleClose = () => {
    setFormData({
      to: "",
      subject: courrier ? `Courrier: ${courrier.fileName}` : "",
      message: ""
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
              <h2>Envoyer par email</h2>
            </div>
            <button className="closeBtn" onClick={handleClose} type="button">
              <MdClose />
            </button>
          </header>

          {/* Courrier Info */}
          {courrier && (
            <div className="courrierInfo">
              <FiFileText className="courrierIcon" />
              <div className="courrierDetails">
                <span className="fileName">{courrier.fileName}</span>
                <span className="fileInfo">
                  {courrier.kind} • {courrier.department} • {courrier.direction}
                </span>
              </div>
            </div>
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
                Message personnalisé (optionnel)
              </label>
              <textarea
                id="emailMessage"
                placeholder="Ajouter un message personnalisé... (Un message par défaut sera utilisé si vide)"
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
                    Envoi...
                  </>
                ) : (
                  <>
                    Envoyer
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
              Le courrier sera envoyé en pièce jointe. Un email avec les détails du document 
              sera automatiquement généré si aucun message personnalisé n'est fourni.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailModal;