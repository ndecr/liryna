import { ReactElement, useEffect, useState } from 'react';
import { validatePasswordStrength, PasswordStrength, generateStrongPassword, estimateCrackTime } from '../../utils/scripts/passwordValidation';
import './passwordStrengthIndicator.scss';

interface PasswordStrengthIndicatorProps {
  password: string;
  showDetails?: boolean;
  onValidityChange?: (isValid: boolean, strength: PasswordStrength) => void;
}

function PasswordStrengthIndicator({ 
  password, 
  showDetails = true,
  onValidityChange 
}: PasswordStrengthIndicatorProps): ReactElement {
  const [strength, setStrength] = useState<PasswordStrength | null>(null);
  const [showCrackTime, setShowCrackTime] = useState<boolean>(false);

  useEffect(() => {
    if (password) {
      const passwordStrength = validatePasswordStrength(password);
      setStrength(passwordStrength);
      onValidityChange?.(passwordStrength.isValid, passwordStrength);
    } else {
      setStrength(null);
      onValidityChange?.(false, {} as PasswordStrength);
    }
  }, [password, onValidityChange]);

  const handleGeneratePassword = () => {
    const generatedPassword = generateStrongPassword(16);
    // Émettre un événement personnalisé pour informer le parent
    const event = new CustomEvent('passwordGenerated', { 
      detail: { password: generatedPassword } 
    });
    document.dispatchEvent(event);
  };

  const getStrengthClass = (score: number): string => {
    switch (score) {
      case 0:
      case 1:
        return 'very-weak';
      case 2:
        return 'weak';
      case 3:
        return 'fair';
      case 4:
        return 'good';
      case 5:
        return 'strong';
      default:
        return 'none';
    }
  };

  const getStrengthLabel = (score: number): string => {
    switch (score) {
      case 0:
      case 1:
        return 'Très faible';
      case 2:
        return 'Faible';
      case 3:
        return 'Acceptable';
      case 4:
        return 'Bon';
      case 5:
        return 'Excellent';
      default:
        return '';
    }
  };

  if (!password) {
    return (
      <div id="passwordStrengthIndicator" className="password-strength-container">
        <div className="password-tools">
          <button 
            type="button"
            className="generate-password-btn"
            onClick={handleGeneratePassword}
            title="Générer un mot de passe sécurisé"
          >
            🎲 Générer un mot de passe fort
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="passwordStrengthIndicator" className="password-strength-container">
      {strength && (
        <>
          {/* Barre de force */}
          <div className="strength-bar-container">
            <div className="strength-label">
              Force : <span className={`strength-text ${getStrengthClass(strength.score)}`}>
                {getStrengthLabel(strength.score)}
              </span>
            </div>
            <div className="strength-bar">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`strength-segment ${
                    level <= strength.score ? getStrengthClass(strength.score) : 'empty'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Indicateur de validation */}
          <div className={`validation-status ${strength.isValid ? 'valid' : 'invalid'}`}>
            {strength.isValid ? (
              <span className="status-valid">✅ Mot de passe valide</span>
            ) : (
              <span className="status-invalid">❌ Mot de passe invalide</span>
            )}
          </div>

          {/* Détails des exigences */}
          {showDetails && (
            <div className="password-requirements">
              <div className="requirements-header">
                <span>Critères de sécurité</span>
                <button
                  type="button"
                  className="crack-time-btn"
                  onClick={() => setShowCrackTime(!showCrackTime)}
                  title="Afficher le temps estimé pour craquer ce mot de passe"
                >
                  🕒 Temps de craquage
                </button>
              </div>
              
              {showCrackTime && (
                <div className="crack-time-display">
                  <strong>Temps estimé pour craquer : </strong>
                  <span className="crack-time">{estimateCrackTime(password)}</span>
                </div>
              )}

              <div className="requirements-grid">
                {strength.requirements
                  .filter(req => req.priority === 'critical')
                  .map((req) => (
                    <div key={req.name} className={`requirement ${req.isMet ? 'met' : 'unmet'} critical`}>
                      <span className="requirement-icon">
                        {req.isMet ? '✅' : '❌'}
                      </span>
                      <span className="requirement-text">{req.description}</span>
                    </div>
                  ))}
                
                {strength.requirements
                  .filter(req => req.priority === 'important')
                  .map((req) => (
                    <div key={req.name} className={`requirement ${req.isMet ? 'met' : 'unmet'} important`}>
                      <span className="requirement-icon">
                        {req.isMet ? '✅' : '⚠️'}
                      </span>
                      <span className="requirement-text">{req.description}</span>
                    </div>
                  ))}

                {strength.requirements
                  .filter(req => req.priority === 'recommended')
                  .map((req) => (
                    <div key={req.name} className={`requirement ${req.isMet ? 'met' : 'unmet'} recommended`}>
                      <span className="requirement-icon">
                        {req.isMet ? '✅' : 'ℹ️'}
                      </span>
                      <span className="requirement-text">{req.description}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Messages de feedback */}
          {strength.feedback.length > 0 && (
            <div className="feedback-messages">
              {strength.feedback.map((message, index) => (
                <div key={index} className="feedback-message">
                  {message}
                </div>
              ))}
            </div>
          )}

          {/* Outils */}
          <div className="password-tools">
            <button 
              type="button"
              className="generate-password-btn"
              onClick={handleGeneratePassword}
              title="Générer un mot de passe sécurisé"
            >
              🎲 Générer un mot de passe fort
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default PasswordStrengthIndicator;