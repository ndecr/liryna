// styles
import "./home.scss";

// assets
import devBackground from "../../assets/background/devSection.webp";
import utilsBackground from "../../assets/background/utilsSection.webp";

// hooks | library
import { ReactElement } from "react";
import WithAuth from "../../utils/middleware/WithAuth";
import { Link } from "react-router-dom";

// component
import Header from "../../components/header/Header";
import SubNav from "../../components/subNav/SubNav";

function Home(): ReactElement {
  return (
    <div id="home" className="homeContainer">
      <Header />
      <SubNav />
      <main>
        <div className={"mainWrapper"}>
          <section className={"utilsSection"}>
            <Link to={"/utils"}>
              <figure>
                <img src={utilsBackground} alt={"Bureau de travail"} />
              </figure>
              <h2>Utilitaires</h2>
            </Link>
          </section>
          <section className={"webDevSection"}>
            <Link to={"/web_dev"}>
              <figure>
                <img src={devBackground} alt={"Éditeur de code"} />
              </figure>
              <h2>Développement Web</h2>
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}

const HomeWithAuth = WithAuth(Home);
export default HomeWithAuth;
