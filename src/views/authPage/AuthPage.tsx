// styles
import "./authPage.scss";

// hooks | libraries
import { ReactElement, useState } from "react";

// components
import Header from "../../components/header/Header";
import AuthForm from "../../components/authForm/AuthForm.tsx";
import Footer from "../../components/footer/Footer";

export default function AuthPage(): ReactElement {
  const [isSignIn, setIsSignIn] = useState<boolean>(true);
  const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");

  const handleForgotPassword = () => {
    setIsForgotPassword(true);
  };

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setIsSignIn(true);
  };

  const ChangeFormLink = (): ReactElement => {
    if (isForgotPassword) {
      return (
        <p>
          <button onClick={handleBackToLogin}>Retour à la connexion</button>
        </p>
      );
    }
    return isSignIn ? (
      <p>
        Pas encore de compte ?{" "}
        <button onClick={(): void => setIsSignIn(false)}>Crée un compte</button>{" "}
        !
      </p>
    ) : (
      <p>
        Déjà un compte ?{" "}
        <button onClick={(): void => setIsSignIn(true)}>Connexion</button> !
      </p>
    );
  };

  return (
    <div id="authPage" className="authPageContainer">
      <Header />
      <main>
        <AuthForm
          props={{
            isSignIn,
            isForgotPassword,
            email,
            password,
            firstName,
            lastName,
            setEmail,
            setPassword,
            setFirstName,
            setLastName,
            onForgotPassword: handleForgotPassword,
            onBackToLogin: handleBackToLogin,
          }}
        />
        <div className={'changeFormButtonWrapper'}>
          <ChangeFormLink />
        </div>
      </main>
      <Footer />
    </div>
  );
}
