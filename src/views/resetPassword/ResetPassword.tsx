// styles
import "./resetPassword.scss";

// hooks | libraries
import { ChangeEvent, FormEvent, ReactElement, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// services
import { resetPasswordService } from "../../API/services/auth.service.ts";

// components
import Header from "../../components/header/Header.tsx";
import Footer from "../../components/footer/Footer.tsx";
import Button from "../../components/button/Button.tsx";

export default function ResetPassword(): ReactElement {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const validate = (): string | null => {
    if (password.length < 8) return "Le mot de passe doit contenir au moins 8 caractères.";
    if (password !== confirm) return "Les mots de passe ne correspondent pas.";
    return null;
  };

  const handleSubmit = async (): Promise<void> => {
    setError("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsLoading(true);
    try {
      await resetPasswordService(token, password);
      setIsDone(true);
    } catch {
      setError("Lien invalide ou expiré. Veuillez refaire une demande.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div id="resetPassword" className="resetPasswordContainer">
        <Header />
        <main>
          <div id="authForm">
            <h2>Lien invalide</h2>
            <p className="resetInfo">Ce lien de réinitialisation est invalide.</p>
            <div className="buttonContainer">
              <Button style="seaGreen" type="button" onClick={() => navigate("/auth")}>
                Retour à la connexion
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isDone) {
    return (
      <div id="resetPassword" className="resetPasswordContainer">
        <Header />
        <main>
          <div id="authForm">
            <h2>Mot de passe modifié</h2>
            <p className="resetInfo">Votre mot de passe a été réinitialisé avec succès.</p>
            <div className="buttonContainer">
              <Button style="seaGreen" type="button" onClick={() => navigate("/auth")}>
                Se connecter
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div id="resetPassword" className="resetPasswordContainer">
      <Header />
      <main>
        <form
          id="authForm"
          onSubmit={(e: FormEvent<HTMLFormElement>): void => {
            e.preventDefault();
            handleSubmit().finally();
          }}
        >
          <h2>Nouveau mot de passe</h2>
          <p className="resetInfo">Choisissez un mot de passe d'au moins 8 caractères.</p>
          <div className="inputContainer">
            <label htmlFor="newPassword">Nouveau mot de passe</label>
            <input
              id="newPassword"
              type="password"
              value={password}
              autoFocus
              autoComplete="new-password"
              onChange={(e: ChangeEvent<HTMLInputElement>): void => setPassword(e.target.value)}
            />
          </div>
          <div className="inputContainer">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirm}
              autoComplete="new-password"
              onChange={(e: ChangeEvent<HTMLInputElement>): void => setConfirm(e.target.value)}
            />
          </div>
          {error && <div className="errorMessage">{error}</div>}
          <div className="buttonContainer">
            <Button style="seaGreen" type="submit" disabled={isLoading}>
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
