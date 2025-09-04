// styles
import "./utils.scss";

interface IViewCard {
  title: string;
  description: string;
  url: string;
}

// hooks | libraries
import { ReactElement } from "react";
import { Link } from "react-router-dom";

// components
import WithAuth from "../../utils/middleware/WithAuth.tsx";
import Header from "../../components/header/Header.tsx";
import SubNav from "../../components/subNav/SubNav.tsx";

function Utils(): ReactElement {
  const subApps: IViewCard[] = [
    {
      title: "Courrier",
      description: "Gérez vos courriers",
      url: "/utils/mail",
    },
  ];

  const ViewCard = ({ title, description, url }: IViewCard): ReactElement => {
    return (
      <article id="viewCard">
        <Link to={url}>
          <div className="cardContent">
            <h2 className="sectionCardTitle">{title}</h2>
            <p className="sectionCardDescription">{description}</p>
          </div>
        </Link>
      </article>
    );
  };

  return (
    <>
      <Header />
      <SubNav />
      <main id="utils" className="utilsMain">
        <section className="utilsContent">
          <h1 className="utilsTitle">Outils utilitaires</h1>
          <div className="utilsWelcome">
            {subApps.map((app) => (
              <ViewCard key={app.title} {...app} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

const UtilsWithAuth = WithAuth(Utils);
export default UtilsWithAuth;
