// styles
import "./musique.scss";

// hooks | libraries
import { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { IoMusicalNotes } from "react-icons/io5";
import { GiGuitar, GiMusicalNotes } from "react-icons/gi";
import { MdLibraryMusic } from "react-icons/md";

// components
import WithAuth from "../../utils/middleware/WithAuth.tsx";
import Header from "../../components/header/Header.tsx";
import SubNav from "../../components/subNav/SubNav.tsx";

function Musique(): ReactElement {
  const navigate = useNavigate();

  const actions = [
    {
      id: "programme-guitare",
      label: "Programme Guitare",
      icon: <GiGuitar />,
      route: "/musique/programme-guitare",
      primary: true,
    },
    {
      id: "mon-repertoire",
      label: "Mon Répertoire",
      icon: <MdLibraryMusic />,
      route: "/musique/repertoire",
      primary: false,
    },
    {
      id: "accordages-guitare",
      label: "Liste d'accordage guitare",
      icon: <GiMusicalNotes />,
      route: "/musique/accordages-guitare",
      primary: false,
    },
  ];

  const handleActionClick = (route: string) => {
    navigate(route);
  };

  return (
    <>
      <Header />
      <SubNav />
      <main id="musique" className="musiqueMain">
        <div className="musiqueContainer">
          <section className="musiqueHeader" data-aos="fade-down">
            <div className="musiqueIcon">
              <IoMusicalNotes />
            </div>
            <h1 className="musiqueTitle">Musique</h1>
            <p className="musiqueSubtitle">Apprentissage et progression musicale</p>
          </section>

          <section className="musiqueActions" data-aos="fade-up" data-aos-delay="100">
            <div className="actionsGrid">
              {actions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  className={`actionBtn ${action.primary ? "primary" : ""}`}
                  onClick={() => handleActionClick(action.route)}
                >
                  <span className="actionIcon">{action.icon}</span>
                  <span className="actionText">{action.label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

const MusiqueWithAuth = WithAuth(Musique);
export default MusiqueWithAuth;
