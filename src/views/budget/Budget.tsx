// styles
import "./budget.scss";

// hooks | libraries
import { ReactElement, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoWallet, IoTrendingUp, IoTrendingDown } from "react-icons/io5";
import { MdDashboard } from "react-icons/md";
import { IoCreate } from "react-icons/io5";
import { FiDollarSign } from "react-icons/fi";

// components
import WithAuth from "../../utils/middleware/WithAuth.tsx";
import Header from "../../components/header/Header.tsx";
import SubNav from "../../components/subNav/SubNav.tsx";

// context
import { BudgetContext } from "../../context/budget/BudgetContext.tsx";

function Budget(): ReactElement {
  const navigate = useNavigate();
  const { dashboard, getBudgetDashboard } = useContext(BudgetContext);
  const [dashboardLoading, setDashboardLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        await getBudgetDashboard();
      } catch (error) {
        console.error("Error loading budget dashboard:", error);
      } finally {
        setDashboardLoading(false);
      }
    };

    loadDashboard();
  }, [getBudgetDashboard]);

  const actions = [
    {
      id: "dashboard",
      label: "Tableau de bord",
      icon: <MdDashboard />,
      primary: true,
    },
    {
      id: "edit",
      label: "Editer le budget",
      icon: <IoCreate />,
      primary: false,
    },
  ];

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const statsDisplay = [
    {
      id: "revenus",
      label: "Revenus",
      value: dashboardLoading
        ? "..."
        : formatCurrency(dashboard?.totaux?.revenus || 0),
      icon: <IoTrendingUp />,
      color: "success" as const,
    },
    {
      id: "charges",
      label: "Charges totales",
      value: dashboardLoading
        ? "..."
        : formatCurrency(dashboard?.totaux?.totalCharges || 0),
      icon: <IoTrendingDown />,
      color: "warning" as const,
    },
    {
      id: "reste",
      label: "Reste a vivre",
      value: dashboardLoading
        ? "..."
        : formatCurrency(dashboard?.totaux?.resteAVivre || 0),
      icon: <IoWallet />,
      color:
        (dashboard?.totaux?.resteAVivre || 0) >= 0
          ? ("primary" as const)
          : ("danger" as const),
    },
    {
      id: "endettement",
      label: "Taux endettement",
      value: dashboardLoading
        ? "..."
        : `${dashboard?.indicateurs?.tauxEndettement || 0}%`,
      icon: <FiDollarSign />,
      color:
        (dashboard?.indicateurs?.tauxEndettement || 0) > 33
          ? ("danger" as const)
          : ("info" as const),
    },
  ];

  const handleActionClick = (
    event: React.MouseEvent,
    actionId: string
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (actionId === "dashboard") {
      navigate("/budget/dashboard");
    } else if (actionId === "edit") {
      navigate("/budget/edit");
    }
  };

  return (
    <>
      <Header />
      <SubNav />
      <main id="budget" className="budgetMain">
        <div className="budgetContainer">
          <section className="budgetHeader" data-aos="fade-down">
            <h1 className="budgetTitle">Gestion du budget</h1>
            <p className="budgetSubtitle">
              Suivez et gerez votre budget familial
            </p>
          </section>

          <section
            className="budgetActions"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <div className="actionsGrid">
              {actions.map((action, index) => (
                <button
                  key={action.id}
                  type="button"
                  className={`actionBtn ${action.primary ? "primary" : ""}`}
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

          <section
            className="budgetStats"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <h2 className="statsTitle">
              {dashboardLoading
                ? "Chargement..."
                : dashboard
                  ? "Apercu du budget"
                  : "Aucun budget configure"}
            </h2>
            {(dashboard || dashboardLoading) && (
              <div className="statsGrid">
                {statsDisplay.map((stat, index) => (
                  <div
                    key={stat.id}
                    className={`statCard ${stat.color}`}
                    data-aos="zoom-in"
                    data-aos-delay={250 + index * 100}
                  >
                    <div className="statIcon">{stat.icon}</div>
                    <div className="statContent">
                      <div className="statValue">{stat.value}</div>
                      <div className="statLabel">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {dashboard?.recommandation && (
            <section
              className={`budgetRecommandation ${dashboard.recommandation.level}`}
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <p>{dashboard.recommandation.message}</p>
            </section>
          )}
        </div>
      </main>
    </>
  );
}

const BudgetWithAuth = WithAuth(Budget);
export default BudgetWithAuth;
