import { ReactElement, useEffect, useState } from 'react';
import { validatePasswordStrength, PasswordStrength, generateStrongPassword } from '../../utils/scripts/passwordValidation';
import './passwordStrengthIndicator.scss';

interface PasswordStrengthIndicatorProps {
  password: string;
  onValidityChange?: (isValid: boolean, strength: PasswordStrength) => void;
}

function PasswordStrengthIndicator({ 
  password, 
  onValidityChange 
}: PasswordStrengthIndicatorProps): ReactElement {
  const [strength, setStrength] = useState<PasswordStrength | null>(null);

  useEffect(() => {
    if (password) {
      const passwordStrength = validatePasswordStrength(password);
      setStrength(passwordStrength);
      onValidityChange?.(passwordStrength.isValid, passwordStrength);
    } else {
      setStrength(null);
      onValidityChange?.(false, {} as PasswordStrength);
    }
  }, [password]); // Supprimer onValidityChange des dépendances pour éviter la boucle

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
        <div className="tools">
          <button 
            type="button"
            className="generate-password-btn"
            onClick={handleGeneratePassword}
            title="Générer un mot de passe sécurisé"
          >
            🎲 Générer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="passwordStrengthIndicator" className="password-strength-container">
      {strength && (
        <>
          {/* Informations de force et validation */}
          <div className="strength-info">
            <span className={`strength-text ${getStrengthClass(strength.score)}`}>
              {getStrengthLabel(strength.score)}
            </span>
            <span className="validation-status">
              {strength.isValid ? '✅' : '❌'}
            </span>
          </div>

          {/* Barre de force */}
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

          {/* Critères essentiels non respectés uniquement */}
          <div className="requirements">
            {strength.requirements
              .filter(req => req.priority === 'critical' && !req.isMet)
              .slice(0, 2) // Maximum 2 critères non respectés
              .map((req) => (
                <div key={req.name} className="requirement">
                  <span className="requirement-icon">❌</span>
                  <span className="requirement-text">{req.description}</span>
                </div>
              ))}
          </div>

          {/* Bouton générer si mot de passe invalide */}
          {!strength.isValid && (
            <div className="tools">
              <button 
                type="button"
                className="generate-password-btn"
                onClick={handleGeneratePassword}
                title="Générer un mot de passe sécurisé"
              >
                🎲 Générer
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PasswordStrengthIndicator;