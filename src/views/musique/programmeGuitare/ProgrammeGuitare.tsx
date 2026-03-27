// styles
import "./programmeGuitare.scss";

// hooks | libraries
import { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { GiGuitar } from "react-icons/gi";
import { MdOutlineArrowBack } from "react-icons/md";
import { FaGuitar } from "react-icons/fa";

// components
import WithAuth from "../../../utils/middleware/WithAuth.tsx";
import Header from "../../../components/header/Header.tsx";
import SubNav from "../../../components/subNav/SubNav.tsx";

function ProgrammeGuitare(): ReactElement {
  const navigate = useNavigate();

  const programmes = [
    {
      id: "metal-progression",
      label: "Metal Guitar Progression",
      description: "25 morceaux du power chord au tremolo pick",
      icon: <FaGuitar />,
      primary: true,
    },
  ];

  const handleProgrammeClick = (programmeId: string) => {
    if (programmeId === "metal-progression") {
      navigate("/musique/programme-guitare/metal-progression");
    }
  };

  return (
    <>
      <Header />
      <SubNav />
      <main id="programmeGuitare" className="programmeGuitareMain">
        <div className="programmeGuitareContainer">
          <button
            type="button"
            className="backButton"
            onClick={() => navigate("/musique")}
          >
            <MdOutlineArrowBack />
            <span>Retour</span>
          </button>

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
                className={`programmeCard ${programme.primary ? "primary" : ""}`}
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
