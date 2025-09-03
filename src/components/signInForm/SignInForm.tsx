// hooks | library
import {
  ChangeEvent,
  FormEvent,
  ReactElement,
  useContext,
  useEffect,
  useState,
} from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";

// custom types
interface ISignInFormProps {
  email: string;
  password: string;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
}

// context
import { UserContext } from "../../context/user/UserContext.tsx";
import { IUserCredentials } from "../../utils/types/user.types.ts";

// utils
import { handleAuthError } from "../../utils/scripts/authErrorHandling.ts";

// components
import Button from "../button/Button.tsx";

export default function SignInForm({
  email,
  password,
  setEmail,
  setPassword,
}: Readonly<ISignInFormProps>): ReactElement {
  const navigate: NavigateFunction = useNavigate();
  const { login, user, isLoading } = useContext(UserContext);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (): Promise<void> => {
    setError("");
    const credentials: IUserCredentials = {
      email,
      password,
    };
    
    try {
      await login(credentials);
    } catch (error: unknown) {
      console.error("Login error:", error);
      const errorMessage = handleAuthError(error);
      setError(errorMessage);
    }
  };

  useEffect((): void => {
    if (user) {
      console.log("user =>", user);
      navigate("/home");
    }
  }, [user]);

  return (
    <form
      id={"authForm"}
      onSubmit={(e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        handleSubmit().finally();
      }}
    >
      <h2>Se connecter</h2>
      <div className={"inputContainer"}>
        <label htmlFor={"email"}>Identifiant</label>
        <input
          id={"email"}
          type={"email"}
          value={email}
          autoComplete={"on"}
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
          style="orange" 
          children={isLoading ? "Connexion..." : "Connexion"} 
          type="submit" 
          disabled={isLoading}
        />
      </div>
    </form>
  );
}
