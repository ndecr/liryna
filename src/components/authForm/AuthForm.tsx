// styles
import "./authForm.scss";

// hooks | library
import { ReactElement } from "react";

// component
import SignInForm from "../signInForm/SignInForm";
import SignUpForm from "../signUpForm/SignUpForm";

interface IAuthFormProps {
  props: {
    isSignIn: boolean;
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
  };
}

export default function AuthForm({
  props,
}: Readonly<IAuthFormProps>): ReactElement {
  const {
    isSignIn,
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
  } = props;

  return (
    <div id="authFormWrapper">
      {isSignIn ? (
        <SignInForm
          email={email}
          password={password}
          setEmail={setEmail}
          setPassword={setPassword}
        />
      ) : (
        <SignUpForm
          email={email}
          password={password}
          passwordConfirmation={passwordConfirmation}
          firstName={firstName}
          lastName={lastName}
          setEmail={setEmail}
          setPassword={setPassword}
          setPasswordConfirmation={setPasswordConfirmation}
          setFirstName={setFirstName}
          setLastName={setLastName}
        />
      )}
    </div>
  );
}
