// hooks | library
import { ChangeEvent, ReactElement, useContext, useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { IoEye, IoEyeOff } from "react-icons/io5";

// components
import PasswordStrengthIndicator from "../passwordStrengthIndicator/PasswordStrengthIndicator.tsx";

// utils
import { PasswordStrength } from "../../utils/scripts/passwordValidation.ts";

// custom types
interface ISignUpFormProps {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
}

// context
import { UserContext } from "../../context/user/UserContext.tsx";
import { IUserRegistration } from "../../utils/types/user.types.ts";

// utils
import { handleRegistrationError } from "../../utils/scripts/authErrorHandling.ts";

// components
import Button from "../button/Button";

export default function SignUpForm({
  email,
  password,
  firstName,
  lastName,
  setEmail,
  setPassword,
  setFirstName,
  setLastName,
}: Readonly<ISignUpFormProps>): ReactElement {
  const navigate = useNavigate();
  const { register, user, isLoading } = useContext(UserContext);
  const [error, setError] = useState<string>("");
  const [passwordIsValid, setPasswordIsValid] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  // const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null); // Non utilisé
  
  const handleSubmit = async (): Promise<void> => {
    setError("");
    
    // Validation
    if (!email || !password || !firstName || !lastName) {
      setError("Tous les champs sont requis.");
      return;
    }
    
    if (!passwordIsValid) {
      setError("Le mot de passe ne respecte pas les critères de sécurité requis.");
      return;
    }
    
    if (firstName.trim().length < 2) {
      setError("Le prénom doit contenir au moins 2 caractères.");
      return;
    }
    
    if (lastName.trim().length < 2) {
      setError("Le nom doit contenir au moins 2 caractères.");
      return;
    }
    
    const userData: IUserRegistration = {
      email: email.trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    };
    
    try {
      await register(userData);
    } catch (error: unknown) {
      console.error("Registration error:", error);
      const errorMessage = handleRegistrationError(error);
      setError(errorMessage);
    }
  };

  // Gestionnaire de validation du mot de passe
  const handlePasswordValidityChange = (isValid: boolean, _strength: PasswordStrength) => {
    setPasswordIsValid(isValid);
    // setPasswordStrength(strength); // Non utilisé
  };

  // Gestionnaire de génération de mot de passe
  useEffect(() => {
    const handlePasswordGenerated = (event: CustomEvent) => {
      const generatedPassword = event.detail.password;
      setPassword(generatedPassword);
    };

    document.addEventListener('passwordGenerated', handlePasswordGenerated as EventListener);
    
    return () => {
      document.removeEventListener('passwordGenerated', handlePasswordGenerated as EventListener);
    };
  }, []); // Pas de dépendances - les fonctions setters sont stables dans React
  
  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);
  return (
    <form 
      id={"authForm"}
      onSubmit={(e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        handleSubmit().finally();
      }}
    >
      <h2>Crée un compte</h2>
      <div className={"inputContainer"}>
        <label htmlFor={"firstName"}>Prénom</label>
        <input
          id={"firstName"}
          type={"text"}
          value={firstName}
          autoComplete={"given-name"}
          onChange={(e: ChangeEvent<HTMLInputElement>): void =>
            setFirstName(e.target.value)
          }
        />
      </div>
      <div className={"inputContainer"}>
        <label htmlFor={"lastName"}>Nom</label>
        <input
          id={"lastName"}
          type={"text"}
          value={lastName}
          autoComplete={"family-name"}
          onChange={(e: ChangeEvent<HTMLInputElement>): void =>
            setLastName(e.target.value)
          }
        />
      </div>
      <div className={"inputContainer"}>
        <label htmlFor={"email"}>Email</label>
        <input
          id={"email"}
          type={"email"}
          value={email}
          autoComplete={"email"}
          onChange={(e: ChangeEvent<HTMLInputElement>): void =>
            setEmail(e.target.value)
          }
        />
      </div>
      <div className={"inputContainer"}>
        <label htmlFor={"password"}>Mot de passe</label>
        <div className="password-input-container">
          <input
            id={"password"}
            type={showPassword ? "text" : "password"}
            value={password}
            autoComplete={"on"}
            onChange={(e: ChangeEvent<HTMLInputElement>): void =>
              setPassword(e.target.value)
            }
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? <IoEyeOff /> : <IoEye />}
          </button>
        </div>
      </div>
      
      {/* Indicateur de force du mot de passe */}
      <PasswordStrengthIndicator
        password={password}
        onValidityChange={handlePasswordValidityChange}
      />
      
      {error && (
        <div className="errorMessage">
          {error}
        </div>
      )}
      <div className={"buttonContainer"}>
        <Button 
          style={"seaGreen"} 
          children={isLoading ? "Inscription..." : "S'enregistrer"} 
          type={"submit"} 
          disabled={isLoading}
        />
      </div>
    </form>
  );
}
