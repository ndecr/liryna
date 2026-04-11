// styles
import "./authPage.scss";

// hooks | libraries
import { ReactElement } from "react";
import { Outlet } from "react-router-dom";

// components
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";

export default function AuthPage(): ReactElement {
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
