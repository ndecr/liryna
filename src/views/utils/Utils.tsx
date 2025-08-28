// styles
import "./utils.scss";

// hooks | libraries
import { ReactElement } from "react";

// components
import WithAuth from "../../utils/middleware/WithAuth.tsx";
import Header from "../../components/header/Header.tsx";
import SubNav from "../../components/subNav/SubNav.tsx";
import Footer from "../../components/footer/Footer.tsx";

function Utils(): ReactElement {
  return (
    <>
      <Header />
      <SubNav />
      <main id="utils" className="utilsMain">
        <section className="utilsContent">
          <h1 className="utilsTitle">Outils utilitaires</h1>
          <div className="utilsWelcome">
            <p>Bienvenue dans la section utilitaires. Utilisez la navigation pour accéder aux différents outils disponibles.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

const UtilsWithAuth = WithAuth(Utils);
export default UtilsWithAuth;
