// styles
import "./home.scss";

// assets
import mailBackground from "../../assets/background/mailSectionBckground.webp";
import budgetBackground from "../../assets/background/comptaBackground.webp";
import musicBackground from "../../assets/background/musicSectionBackground.webp";

// hooks | library
import { ReactElement } from "react";
import WithAuth from "../../utils/middleware/WithAuth";
import { Link } from "react-router-dom";

// component
import Header from "../../components/header/Header";
import SubNav from "../../components/subNav/SubNav";

// hooks
import { useUser } from "../../hooks/useUser.ts";

function Home(): ReactElement {
  const { user } = useUser();
  const visibleSections = user?.visibleSections ?? { mail: true, budget: true, musique: true };

  return (
    <div id="home" className="homeContainer">
      <Header />
      <SubNav />
      <main>
        <div className={"mainWrapper"}>
          {visibleSections.mail && (
            <section className={"utilsSection"}>
              <Link to={"/mail"}>
                <figure>
                  <img src={mailBackground} alt={"Bureau de travail"} />
                </figure>
                <h2>Gestion des courriers</h2>
              </Link>
            </section>
          )}
          {visibleSections.budget && (
            <section className={"webDevSection"}>
              <Link to={"/budget"}>
                <figure>
                  <img src={budgetBackground} alt={"Gestion du budget"} />
                </figure>
                <h2>Gestion du budget</h2>
              </Link>
            </section>
          )}
          {visibleSections.musique && (
            <section className={"musiqueSection"}>
              <Link to={"/musique"}>
                <figure>
                  <img src={musicBackground} alt={"Musique"} />
                </figure>
                <h2>Musique</h2>
              </Link>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

const HomeWithAuth = WithAuth(Home);
export default HomeWithAuth;
