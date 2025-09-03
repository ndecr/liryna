// styles
import "./courriers.scss";

// hooks | libraries
import { ReactElement, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdAdd, MdList, MdSearch, MdArchive } from "react-icons/md";
import { IoMail, IoMailOpen } from "react-icons/io5";
import { FiCalendar, FiFileText } from "react-icons/fi";

// components
import WithAuth from "../../utils/middleware/WithAuth.tsx";
import Header from "../../components/header/Header.tsx";
import SubNav from "../../components/subNav/SubNav.tsx";
import Footer from "../../components/footer/Footer.tsx";

function Courriers(): ReactElement {
  const navigate = useNavigate();
  const [activeAction, setActiveAction] = useState<string>("");

  const actions = [
    {
      id: 'new',
      label: 'Nouveau courrier',
      icon: <MdAdd />,
      primary: true
    },
    {
      id: 'list',
      label: 'Liste des courriers',
      icon: <MdList />,
      primary: false
    },
    {
      id: 'search',
      label: 'Rechercher',
      icon: <MdSearch />,
      primary: false
    },
    {
      id: 'archive',
      label: 'Archives',
      icon: <MdArchive />,
      primary: false
    }
  ];

  const stats = [
    {
      id: 'total',
      label: 'Total courriers',
      value: '125',
      icon: <FiFileText />,
      color: 'primary'
    },
    {
      id: 'incoming',
      label: 'Entrants',
      value: '78',
      icon: <IoMail />,
      color: 'info'
    },
    {
      id: 'outgoing',
      label: 'Sortants',
      value: '47',
      icon: <IoMailOpen />,
      color: 'success'
    },
    {
      id: 'monthly',
      label: 'Ce mois',
      value: '23',
      icon: <FiCalendar />,
      color: 'warning'
    }
  ];

  const handleActionClick = (event: React.MouseEvent, actionId: string) => {
    event.preventDefault();
    event.stopPropagation();
    console.log("Action clicked:", actionId); // Debug
    console.log("Current location:", window.location.pathname); // Debug
    if (actionId === 'new') {
      console.log("Navigating to new courrier"); // Debug
      navigate("/utils/mail/new");
    } else if (actionId === 'list') {
      console.log("Navigating to list courriers"); // Debug
      navigate("/utils/mail/list");
    } else {
      console.log("Setting active action:", actionId); // Debug
      setActiveAction(actionId);
    }
  };

  return (
    <>
      <Header />
      <SubNav />
      <main id="courriers" className="courriersMain">
        <div className="courriersContainer">
          <section className="courriersHeader" data-aos="fade-down">
            <h1 className="courriersTitle">Gestion des courriers</h1>
            <p className="courriersSubtitle">Organisez et suivez vos courriers efficacement</p>
          </section>

          <section className="courriersActions" data-aos="fade-up" data-aos-delay="100">
            <div className="actionsGrid">
              {actions.map((action, index) => (
                <button
                  key={action.id}
                  type="button"
                  className={`actionBtn ${action.primary ? 'primary' : ''} ${activeAction === action.id ? 'active' : ''}`}
                  onClick={(event) => handleActionClick(event, action.id)}
                  data-aos="fade-up"
                  data-aos-delay={150 + index * 50}
                >
                  <span className="actionIcon">{action.icon}</span>
                  <span className="actionText">{action.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="courriersStats" data-aos="fade-up" data-aos-delay="200">
            <h2 className="statsTitle">Statistiques</h2>
            <div className="statsGrid">
              {stats.map((stat, index) => (
                <div
                  key={stat.id}
                  className={`statCard ${stat.color}`}
                  data-aos="zoom-in"
                  data-aos-delay={250 + index * 100}
                >
                  <div className="statIcon">
                    {stat.icon}
                  </div>
                  <div className="statContent">
                    <div className="statValue">{stat.value}</div>
                    <div className="statLabel">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {activeAction && (
            <section className="courriersContent" data-aos="fade-up" data-aos-delay="300">
              <div className="contentCard">
                <h3>Section: {actions.find(a => a.id === activeAction)?.label}</h3>
                <p>Le contenu de cette section sera développé selon vos besoins spécifiques.</p>
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

const CourriersWithAuth = WithAuth(Courriers);
export default CourriersWithAuth;