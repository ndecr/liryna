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
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");



  const ChangeFormLink = (): ReactElement => {
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
            isSignIn: isSignIn,
            email: email,
            password: password,
            passwordConfirmation: passwordConfirmation,
            firstName: firstName,
            lastName: lastName,
            setEmail: setEmail,
            setPassword: setPassword,
            setPasswordConfirmation: setPasswordConfirmation,
            setFirstName: setFirstName,
            setLastName: setLastName,
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
