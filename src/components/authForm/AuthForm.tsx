// styles
import "./authForm.scss";

// hooks | library
import { ReactElement } from "react";

// components
import SignInForm from "../signInForm/SignInForm";
import SignUpForm from "../signUpForm/SignUpForm";
import ForgotPasswordForm from "../forgotPasswordForm/ForgotPasswordForm.tsx";

interface IAuthFormProps {
  props: {
    isSignIn: boolean;
    isForgotPassword: boolean;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    setEmail: (value: string) => void;
    setPassword: (value: string) => void;
    setFirstName: (value: string) => void;
    setLastName: (value: string) => void;
    onForgotPassword: () => void;
    onBackToLogin: () => void;
  };
}

export default function AuthForm({
  props,
}: Readonly<IAuthFormProps>): ReactElement {
  const {
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
    onForgotPassword,
    onBackToLogin,
  } = props;

  return (
    <div id="authFormWrapper">
      {isForgotPassword ? (
        <ForgotPasswordForm onBack={onBackToLogin} />
      ) : isSignIn ? (
        <SignInForm
          email={email}
          password={password}
          setEmail={setEmail}
          setPassword={setPassword}
          onForgotPassword={onForgotPassword}
        />
      ) : (
        <SignUpForm
          email={email}
          password={password}
          firstName={firstName}
          lastName={lastName}
          setEmail={setEmail}
          setPassword={setPassword}
          setFirstName={setFirstName}
          setLastName={setLastName}
        />
      )}
    </div>
  );
}
