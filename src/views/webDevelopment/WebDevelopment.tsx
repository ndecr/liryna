// styles
import "./webDevelopment.scss";

// hooks | libraries
import { ReactElement } from "react";

// components
import WithAuth from "../../utils/middleware/WithAuth.tsx";
import Header from "../../components/header/Header.tsx";
import SubNav from "../../components/subNav/SubNav.tsx";

function WebDevelopment(): ReactElement {
  return (
    <>
      <Header />
      <SubNav />
      <main id={'webDevelopment'}>
      </main>
    </>
  );
}

const WebDevelopmentWithAuth = WithAuth(WebDevelopment);
export default WebDevelopmentWithAuth;
