// styles
import "./accordagesGuitare.scss";

// hooks | libraries
import { ReactElement, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import { IoChevronDown } from "react-icons/io5";
import { GiGuitar } from "react-icons/gi";

// constants
import {
  GUITAR_TUNING_CATEGORIES,
  STRING_COLORS,
  IGuitarTuning,
} from "../../../utils/constants/guitarTunings.ts";

// components
import WithAuth from "../../../utils/middleware/WithAuth.tsx";
import Header from "../../../components/header/Header.tsx";
import SubNav from "../../../components/subNav/SubNav.tsx";
import Button from "../../../components/button/Button.tsx";

function AccordagesGuitare(): ReactElement {
  const navigate = useNavigate();
  const [expandedCategory, setExpandedCategory] = useState<string | null>("standard");
  const [expandedTuning, setExpandedTuning] = useState<string | null>(null);

  const handleToggleCategory = (categoryId: string) => {
    setExpandedCategory((prev) => (prev === categoryId ? null : categoryId));
    setExpandedTuning(null);
  };

  const handleToggleTuning = (tuningId: string) => {
    setExpandedTuning((prev) => (prev === tuningId ? null : tuningId));
  };

  const STRING_LABELS = ["6", "5", "4", "3", "2", "1"];

  const renderStrings = (tuning: IGuitarTuning) => (
    <div className="tuningStrings">
      {tuning.strings.map((note, idx) => {
        const stringNum = 6 - idx;
        return (
          <div key={idx} className="stringItem">
            <span className="stringNumber" style={{ color: STRING_COLORS[stringNum] }}>
              {STRING_LABELS[idx]}
            </span>
            <span
              className="stringNote"
              style={{
                background: `${STRING_COLORS[stringNum]}18`,
                color: STRING_COLORS[stringNum],
                borderColor: `${STRING_COLORS[stringNum]}40`,
              }}
            >
              {note}
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <Header />
      <SubNav />
      <main id="accordagesGuitare">
        <div className="accordagesContainer">
          <Button style="musiqueBack" onClick={() => navigate("/musique")}>
            <MdArrowBack />
            <span>Retour</span>
          </Button>

          <header className="accordagesHeader">
            <div className="accordagesIcon">
              <GiGuitar />
            </div>
            <h1 className="accordagesTitle">Accordages Guitare</h1>
            <p className="accordagesSubtitle">
              Référence complète · 6 cordes · De la grave à l&apos;aiguë
            </p>
          </header>

          <div className="stringsLegend">
            {[6, 5, 4, 3, 2, 1].map((n) => (
              <div key={n} className="legendItem">
                <span className="legendDot" style={{ background: STRING_COLORS[n] }} />
                <span className="legendLabel">Corde {n}</span>
              </div>
            ))}
          </div>

          <div className="categoriesList">
            {GUITAR_TUNING_CATEGORIES.map((category) => {
              const isOpen = expandedCategory === category.id;

              return (
                <div
                  key={category.id}
                  className={`categoryCard ${isOpen ? "open" : ""}`}
                >
                  <button
                    type="button"
                    className="categoryHeader"
                    onClick={() => handleToggleCategory(category.id)}
                    aria-expanded={isOpen}
                  >
                    <span className="categoryTitle">{category.title}</span>
                    <span className="categoryCount">{category.tunings.length}</span>
                    <IoChevronDown className="categoryChevron" aria-hidden />
                  </button>

                  {isOpen && (
                    <div className="tuningsList">
                      {category.tunings.map((tuning) => {
                        const isExpanded = expandedTuning === tuning.id;

                        return (
                          <div
                            key={tuning.id}
                            className={`tuningItem ${isExpanded ? "expanded" : ""}`}
                          >
                            <button
                              type="button"
                              className="tuningRow"
                              onClick={() => handleToggleTuning(tuning.id)}
                              aria-expanded={isExpanded}
                            >
                              <span className="tuningName">{tuning.name}</span>
                              {!isExpanded && (
                                <span className="tuningPreview">
                                  {tuning.strings.join(" · ")}
                                </span>
                              )}
                              <IoChevronDown className="tuningChevron" aria-hidden />
                            </button>

                            {isExpanded && (
                              <div className="tuningDetails">
                                {renderStrings(tuning)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}

const AccordagesGuitareWithAuth = WithAuth(AccordagesGuitare);
export default AccordagesGuitareWithAuth;
