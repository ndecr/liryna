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
    firstName: string;
    lastName: string;
    setEmail: (value: string) => void;
    setPassword: (value: string) => void;
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
    firstName,
    lastName,
    setEmail,
    setPassword,
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
