// styles
import "./forgotPasswordForm.scss";

// hooks | libraries
import { ChangeEvent, FormEvent, ReactElement, useState } from "react";

// services
import { forgotPasswordService } from "../../API/services/auth.service.ts";

// components
import Button from "../button/Button.tsx";

interface IForgotPasswordFormProps {
  onBack: () => void;
}

export default function ForgotPasswordForm({ onBack: _onBack }: Readonly<IForgotPasswordFormProps>): ReactElement {
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (): Promise<void> => {
    setError("");
    setIsLoading(true);
    try {
      await forgotPasswordService(email);
      setIsDone(true);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isDone) {
    return (
      <div id="authForm">
        <h2>Email envoyé</h2>
        <p className="forgotInfo">
          Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien de réinitialisation sous quelques minutes.
        </p>
      </div>
    );
  }

  return (
    <form
      id="authForm"
      onSubmit={(e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        handleSubmit().finally();
      }}
    >
      <h2>Mot de passe oublié</h2>
      <p className="forgotInfo">
        Entrez votre adresse email. Vous recevrez un lien pour réinitialiser votre mot de passe.
      </p>
      <div className="inputContainer">
        <label htmlFor="forgotEmail">Email</label>
        <input
          id="forgotEmail"
          type="email"
          value={email}
          autoComplete="email"
          autoFocus
          onChange={(e: ChangeEvent<HTMLInputElement>): void => setEmail(e.target.value)}
        />
      </div>
      {error && <div className="errorMessage">{error}</div>}
      <div className="buttonContainer">
        <Button style="seaGreen" type="submit" disabled={isLoading || !email.trim()}>
          {isLoading ? "Envoi..." : "Envoyer le lien"}
        </Button>
      </div>
    </form>
  );
}
