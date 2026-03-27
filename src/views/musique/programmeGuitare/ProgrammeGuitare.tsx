// styles
import "./programmeGuitare.scss";

// hooks | libraries
import { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { GiGuitar } from "react-icons/gi";
import { MdArrowBack } from "react-icons/md";
import { FaGuitar } from "react-icons/fa";

// components
import WithAuth from "../../../utils/middleware/WithAuth.tsx";
import Header from "../../../components/header/Header.tsx";
import SubNav from "../../../components/subNav/SubNav.tsx";
import Button from "../../../components/button/Button.tsx";

function ProgrammeGuitare(): ReactElement {
  const navigate = useNavigate();

  const programmes = [
    {
      id: "rhythm-progression",
      label: "Progression Rythmique",
      description: "25 morceaux des accords ouverts au fingerpicking",
      icon: <FaGuitar />,
    },
    {
      id: "metal-progression",
      label: "Progression Metal",
      description: "25 morceaux du power chord au tremolo pick",
      icon: <FaGuitar />,
    },
    {
      id: "slap-progression",
      label: "Progression Slap",
      description: "25 exercices et morceaux pour maîtriser le slap",
      icon: <FaGuitar />,
    },
  ];

  const handleProgrammeClick = (programmeId: string) => {
    if (programmeId === "metal-progression") {
      navigate("/musique/programme-guitare/metal-progression");
    }
    if (programmeId === "rhythm-progression") {
      navigate("/musique/programme-guitare/rhythm-progression");
    }
    if (programmeId === "slap-progression") {
      navigate("/musique/programme-guitare/slap-progression");
    }
  };

  return (
    <>
      <Header />
      <SubNav />
      <main id="programmeGuitare" className="programmeGuitareMain">
        <div className="programmeGuitareContainer">
          <Button style="musiqueBack" onClick={() => navigate("/musique")}>
            <MdArrowBack />
            <span>Retour</span>
          </Button>

          <section className="programmeGuitareHeader" data-aos="fade-down">
            <div className="programmeGuitareIcon">
              <GiGuitar />
            </div>
            <h1 className="programmeGuitareTitle">Programme Guitare</h1>
            <p className="programmeGuitareSubtitle">
              Progressez methodiquement avec des morceaux soigneusement selectionnes
            </p>
          </section>

          <section className="programmesGrid" data-aos="fade-up" data-aos-delay="100">
            {programmes.map((programme) => (
              <button
                key={programme.id}
                type="button"
                className="programmeCard"
                onClick={() => handleProgrammeClick(programme.id)}
              >
                <span className="programmeCardIcon">{programme.icon}</span>
                <div className="programmeCardContent">
                  <span className="programmeCardLabel">{programme.label}</span>
                  <span className="programmeCardDescription">{programme.description}</span>
                </div>
              </button>
            ))}
          </section>
        </div>
      </main>
    </>
  );
}

const ProgrammeGuitareWithAuth = WithAuth(ProgrammeGuitare);
export default ProgrammeGuitareWithAuth;
