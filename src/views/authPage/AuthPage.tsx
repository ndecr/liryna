// styles
import "./authPage.scss";

// hooks | libraries
import { ReactElement, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

// hooks
import { useUser } from "../../hooks/useUser.ts";

// components
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";

export default function AuthPage(): ReactElement {
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      navigate("/home", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div id="authPage" className="authPageContainer">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
