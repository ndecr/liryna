// hooks | library
import { ChangeEvent, ReactElement, useContext, useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

// components
import PasswordStrengthIndicator from "../passwordStrengthIndicator/PasswordStrengthIndicator.tsx";

// utils
import { PasswordStrength } from "../../utils/scripts/passwordValidation.ts";

// custom types
interface ISignUpFormProps {
  email: string;
  password: string;
  passwordConfirmation: string;
  firstName: string;
  lastName: string;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setPasswordConfirmation: (value: string) => void;
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
  passwordConfirmation,
  firstName,
  lastName,
  setEmail,
  setPassword,
  setPasswordConfirmation,
  setFirstName,
  setLastName,
}: Readonly<ISignUpFormProps>): ReactElement {
  const navigate = useNavigate();
  const { register, user, isLoading } = useContext(UserContext);
  const [error, setError] = useState<string>("");
  const [passwordIsValid, setPasswordIsValid] = useState<boolean>(false);
  // const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null); // Non utilisé
  
  const handleSubmit = async (): Promise<void> => {
    setError("");
    
    // Validation
    if (!email || !password || !passwordConfirmation || !firstName || !lastName) {
      setError("Tous les champs sont requis.");
      return;
    }
    
    if (password !== passwordConfirmation) {
      setError("Les mots de passe ne correspondent pas.");
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
      setPasswordConfirmation(generatedPassword);
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
        <input
          id={"password"}
          type={"password"}
          value={password}
          autoComplete={"on"}
          onChange={(e: ChangeEvent<HTMLInputElement>): void =>
            setPassword(e.target.value)
          }
        />
      </div>
      
      {/* Indicateur de force du mot de passe */}
      <PasswordStrengthIndicator
        password={password}
        showDetails={true}
        onValidityChange={handlePasswordValidityChange}
      />
      
      <div className={"inputContainer"}>
        <label htmlFor={"passwordConfirmation"}>
          Confirmer le mot de passe
        </label>
        <input
          id={"passwordConfirmation"}
          type={"password"}
          value={passwordConfirmation}
          autoComplete={"off"}
          onChange={(e: ChangeEvent<HTMLInputElement>): void =>
            setPasswordConfirmation(e.target.value)
          }
        />
      </div>
      {error && (
        <div className={"errorMessage"} style={{
          color: "#dc3545",
          background: "#f8d7da",
          border: "1px solid #f5c6cb",
          borderRadius: "4px",
          padding: "8px 12px",
          margin: "10px 0",
          fontSize: "14px"
        }}>
          {error}
        </div>
      )}
      <div className={"buttonContainer"}>
        <Button 
          style={"orange"} 
          children={isLoading ? "Inscription..." : "S'enregistrer"} 
          type={"submit"} 
          disabled={isLoading}
        />
      </div>
    </form>
  );
}
