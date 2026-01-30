// styles
import "./budgetDashboard.scss";

// hooks | libraries
import { ReactElement, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoCreate } from "react-icons/io5";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { PieLabelRenderProps } from "recharts";

// components
import WithAuth from "../../../utils/middleware/WithAuth.tsx";
import Header from "../../../components/header/Header.tsx";
import SubNav from "../../../components/subNav/SubNav.tsx";

// context
import { BudgetContext } from "../../../context/budget/BudgetContext.tsx";

const PIE_COLORS = ["#ff6b47", "#ff9800", "#e65100", "#c62828"];
const REVENUS_COLORS = ["#2e7d32", "#4caf50", "#66bb6a", "#81c784"];

interface ChartEntry {
  name: string;
  value: number;
}

function BudgetDashboard(): ReactElement {
  const navigate = useNavigate();
  const { dashboard, getBudgetDashboard } = useContext(BudgetContext);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        await getBudgetDashboard();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors du chargement";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [getBudgetDashboard]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const chargesChartData: ChartEntry[] = dashboard
    ? [
        { name: "Charges fixes", value: dashboard.totaux.chargesFixes },
        { name: "Charges variables", value: dashboard.totaux.chargesVariables },
        { name: "Dettes", value: dashboard.totaux.totalMensualitesDettes },
      ].filter((d) => d.value > 0)
    : [];

  // Si nombrePersonnes >= 2 et qu'il y a des entrees individuelles, afficher par entree
  // sinon afficher par categorie
  const revenusSource = dashboard && dashboard.budget.nombrePersonnes >= 2
    && dashboard?.details?.revenusParEntree
    && Object.keys(dashboard.details.revenusParEntree).length > 1
    ? dashboard.details.revenusParEntree
    : dashboard?.details?.revenusParCategorie;

  const revenusChartData: ChartEntry[] = revenusSource
    ? Object.entries(revenusSource)
        .map(([name, value]) => ({ name, value }))
        .filter((d) => d.value > 0)
    : [];

  const barData = dashboard?.details?.chargesFixesParCategorie
    ? Object.entries(dashboard.details.chargesFixesParCategorie).map(([name, value]) => ({
        name,
        montant: value,
      }))
    : [];

  const tooltipFormatter = (value?: number | string | (number | string)[]): string => {
    if (typeof value === "number") return formatCurrency(value);
    if (value === undefined) return "";
    return String(value);
  };

  const renderPieLabel = (props: PieLabelRenderProps): string => {
    const name = props.name ?? "";
    const percent = typeof props.percent === "number" ? props.percent : 0;
    return `${name} ${(percent * 100).toFixed(0)}%`;
  };

  return (
    <>
      <Header />
      <SubNav />
      <main id="budgetDashboard">
        <div className="dashboardContainer">
          <section className="dashboardHeader" data-aos="fade-down">
            <h1 className="dashboardTitle">Tableau de bord</h1>
            <button
              type="button"
              className="editBtn"
              onClick={() => navigate("/budget/edit")}
            >
              <IoCreate />
              <span>Editer</span>
            </button>
          </section>

          {isLoading && (
            <div className="loadingState" data-aos="fade-up">
              <p>Chargement du tableau de bord...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="errorState" data-aos="fade-up">
              <p>Aucun budget configure</p>
              <button
                type="button"
                className="createBtn"
                onClick={() => navigate("/budget/edit")}
              >
                Creer un budget
              </button>
            </div>
          )}

          {!isLoading && !error && dashboard && (
            <>
              <section className="summaryCards" data-aos="fade-up" data-aos-delay="100">
                <div className="summaryCard revenus">
                  <h3>Revenus</h3>
                  <p className="amount">{formatCurrency(dashboard.totaux.revenus)}</p>
                </div>
                <div className="summaryCard charges-fixes">
                  <h3>Charges fixes</h3>
                  <p className="amount">{formatCurrency(dashboard.totaux.chargesFixes)}</p>
                </div>
                <div className="summaryCard charges-variables">
                  <h3>Charges variables</h3>
                  <p className="amount">{formatCurrency(dashboard.totaux.chargesVariables)}</p>
                </div>
                <div className="summaryCard dettes">
                  <h3>Dettes</h3>
                  <p className="amount">{formatCurrency(dashboard.totaux.totalMensualitesDettes)}</p>
                </div>
              </section>

              <section className="resteAVivre" data-aos="fade-up" data-aos-delay="200">
                <div className={`resteCard ${dashboard.totaux.resteAVivre >= 0 ? "positive" : "negative"}`}>
                  <h2>Reste a vivre</h2>
                  <p className="resteAmount">{formatCurrency(dashboard.totaux.resteAVivre)}</p>
                  <p className="resteDetail">
                    {formatCurrency(dashboard.totaux.resteAVivreParPersonne)} / personne
                    ({dashboard.budget.nombrePersonnes} pers.)
                  </p>
                </div>
              </section>

              <section className="indicateurs" data-aos="fade-up" data-aos-delay="300">
                <div className="indicateurCard">
                  <span className="indicateurLabel">Taux d'endettement</span>
                  <span className={`indicateurValue ${dashboard.indicateurs.tauxEndettement > 33 ? "danger" : "ok"}`}>
                    {dashboard.indicateurs.tauxEndettement}%
                  </span>
                </div>
                <div className="indicateurCard">
                  <span className="indicateurLabel">Ratio charges/revenus</span>
                  <span className={`indicateurValue ${dashboard.indicateurs.ratioChargesRevenus > 80 ? "danger" : "ok"}`}>
                    {dashboard.indicateurs.ratioChargesRevenus}%
                  </span>
                </div>
              </section>

              {dashboard.recommandation && (
                <section
                  className={`recommandation ${dashboard.recommandation.level}`}
                  data-aos="fade-up"
                  data-aos-delay="350"
                >
                  <p>{dashboard.recommandation.message}</p>
                </section>
              )}

              {/* Charts */}
              <section className="chartsSection" data-aos="fade-up" data-aos-delay="400">
                <div className="chartsGrid">
                  {/* Repartition des charges */}
                  {chargesChartData.length > 0 && (
                    <div className="chartCard">
                      <h3 className="chartTitle">Repartition des charges</h3>
                      <div className="chartWrapper">
                        <ResponsiveContainer width="100%" height={280}>
                          <PieChart>
                            <Pie
                              data={chargesChartData}
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              innerRadius={50}
                              dataKey="value"
                              label={renderPieLabel}
                              labelLine={false}
                            >
                              {chargesChartData.map((_, index) => (
                                <Cell key={`cell-charges-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={tooltipFormatter} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Repartition des revenus */}
                  {revenusChartData.length > 0 && (
                    <div className="chartCard">
                      <h3 className="chartTitle">Repartition des revenus</h3>
                      <div className="chartWrapper">
                        <ResponsiveContainer width="100%" height={280}>
                          <PieChart>
                            <Pie
                              data={revenusChartData}
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              innerRadius={50}
                              dataKey="value"
                              label={renderPieLabel}
                              labelLine={false}
                            >
                              {revenusChartData.map((_, index) => (
                                <Cell key={`cell-revenus-${index}`} fill={REVENUS_COLORS[index % REVENUS_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={tooltipFormatter} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>

                {/* Detail charges fixes par categorie */}
                {barData.length > 0 && (
                  <div className="chartCard barChartCard">
                    <h3 className="chartTitle">Detail des charges fixes</h3>
                    <div className="chartWrapper">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-20} textAnchor="end" height={60} />
                          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `${v}€`} />
                          <Tooltip formatter={tooltipFormatter} />
                          <Legend />
                          <Bar dataKey="montant" name="Montant" fill="#ff6b47" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </section>

              {Object.keys(dashboard.details.chargesFixesParCategorie).length > 0 && (
                <section className="detailSection" data-aos="fade-up" data-aos-delay="500">
                  <h2 className="detailTitle">Detail des charges fixes</h2>
                  <div className="detailGrid">
                    {Object.entries(dashboard.details.chargesFixesParCategorie).map(([cat, amount]) => (
                      <div key={cat} className="detailRow">
                        <span className="detailLabel">{cat}</span>
                        <span className="detailAmount">{formatCurrency(amount)}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}

const BudgetDashboardWithAuth = WithAuth(BudgetDashboard);
export default BudgetDashboardWithAuth;
