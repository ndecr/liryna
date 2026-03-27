// styles
import "./musique.scss";

// hooks | libraries
import { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { IoMusicalNotes } from "react-icons/io5";
import { GiGuitar, GiMusicalNotes } from "react-icons/gi";

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
      primary: true,
    },
    {
      id: "accordages-guitare",
      label: "Liste d'accordage guitare",
      icon: <GiMusicalNotes />,
      primary: false,
    },
  ];

  const handleActionClick = (actionId: string) => {
    if (actionId === "programme-guitare") {
      navigate("/musique/programme-guitare");
    } else if (actionId === "accordages-guitare") {
      navigate("/musique/accordages-guitare");
    }
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
                  onClick={() => handleActionClick(action.id)}
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
