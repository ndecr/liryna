// styles
import "./pretImmobilier.scss";

// hooks | libraries
import { ReactElement, useContext, useEffect, useState, useCallback, useRef } from "react";
import { FiHome, FiSave, FiSearch, FiInfo } from "react-icons/fi";
import { IoPersonOutline } from "react-icons/io5";

// context
import { BudgetContext } from "../../../context/budget/BudgetContext.tsx";
import { PretImmobilierContext } from "../../../context/pretImmobilier/PretImmobilierContext.tsx";

// services
import {
  searchCommunesService,
  getCommunesInRadiusService,
  getDvfPricesService
} from "../../../API/services/pretImmobilier.service.ts";

// types
import {
  IBorrower,
  BorrowerStatus,
  PropertyType,
  IScenario,
  ICommuneResult,
  ISimulationResults,
  IGeoCommune,
  IPretImmobilierFormData
} from "../../../utils/types/pretImmobilier.types.ts";

// ─── Constantes ──────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<BorrowerStatus, string> = {
  CDI: "CDI",
  CDD: "CDD",
  chomage: "Chômage",
};

const STATUS_COEFFICIENT: Record<BorrowerStatus, number> = {
  CDI: 1.0,
  CDD: 0.5,
  chomage: 0.0,
};

const RADIUS_OPTIONS = [5, 10, 30, 50, 100];

const MIN_SURFACE_PER_PERSON = 25;
const MIN_SURFACE_PER_CHILD = 10;

// ─── Helpers de calcul ────────────────────────────────────────────────────────

const calcMaxLoan = (
  monthlyPaymentCapacity: number,
  annualLoanRate: number,
  annualInsuranceRate: number,
  years: number
): number => {
  const r = annualLoanRate / 12;
  const n = years * 12;
  const ins = annualInsuranceRate / 12;
  if (r === 0 && ins === 0) return monthlyPaymentCapacity * n;
  const divisor = r > 0
    ? r / (1 - Math.pow(1 + r, -n)) + ins
    : ins;
  return monthlyPaymentCapacity / divisor;
};

const calcMonthlyPayment = (
  principal: number,
  annualLoanRate: number,
  years: number
): number => {
  const r = annualLoanRate / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

const probabilityLevel = (index: number): ICommuneResult["probabilityLevel"] => {
  if (index >= 80) return "excellent";
  if (index >= 50) return "bon";
  if (index >= 25) return "modere";
  return "faible";
};

const formatCurrency = (v: number): string =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v);

const formatPct = (v: number, decimals = 2): string =>
  `${(v * 100).toFixed(decimals)} %`;

// ─── Génération des scénarios ─────────────────────────────────────────────────

const generateScenarios = (count: number): IScenario[] => {
  if (count === 1) {
    return [
      { id: "cdi", label: "CDI", statuses: ["CDI"] },
      { id: "cdd", label: "CDD", statuses: ["CDD"] },
      { id: "chomage", label: "Chômage", statuses: ["chomage"] },
    ];
  }

  if (count === 2) {
    return [
      { id: "all_cdi", label: "A CDI · B CDI", statuses: ["CDI", "CDI"] },
      { id: "a_cdi_b_cdd", label: "A CDI · B CDD", statuses: ["CDI", "CDD"] },
      { id: "a_cdd_b_cdi", label: "A CDD · B CDI", statuses: ["CDD", "CDI"] },
      { id: "a_cdi_b_chomage", label: "A CDI · B chômage", statuses: ["CDI", "chomage"] },
      { id: "all_cdd", label: "A CDD · B CDD", statuses: ["CDD", "CDD"] },
    ];
  }

  // 3+ personnes : générer "Tous CDI", "1 CDD", "2 CDD", "Tous CDD"
  const scenarios: IScenario[] = [];
  const allCdi = Array<BorrowerStatus>(count).fill("CDI");
  scenarios.push({ id: "all_cdi", label: "Tous CDI", statuses: allCdi });

  for (let i = 0; i < count; i++) {
    const s = [...allCdi] as BorrowerStatus[];
    s[i] = "CDD";
    scenarios.push({
      id: `p${i + 1}_cdd`,
      label: `P${i + 1} CDD · autres CDI`,
      statuses: s,
    });
  }

  const allCdd = Array<BorrowerStatus>(count).fill("CDD");
  scenarios.push({ id: "all_cdd", label: "Tous CDD", statuses: allCdd });

  return scenarios;
};

// ─── Composant ───────────────────────────────────────────────────────────────

function PretImmobilier(): ReactElement {
  const { dashboard } = useContext(BudgetContext);
  const { simulation, getSimulation, upsertSimulation } = useContext(PretImmobilierContext);

  // ── Borrowers
  const [borrowers, setBorrowers] = useState<IBorrower[]>([]);
  const [activeScenario, setActiveScenario] = useState<string>("all_cdi");

  // ── Sliders
  const [loanDuration, setLoanDuration] = useState<number>(20);
  const [loanRate, setLoanRate] = useState<number>(0.035);
  const [insuranceRate, setInsuranceRate] = useState<number>(0.003);
  const [apport, setApport] = useState<number>(0);
  const [propertyType, setPropertyType] = useState<PropertyType>("ancien");

  // ── Géo
  const [citySearch, setCitySearch] = useState<string>("");
  const [cityResults, setCityResults] = useState<IGeoCommune[]>([]);
  const [selectedCity, setSelectedCity] = useState<IGeoCommune | null>(null);
  const [searchRadius, setSearchRadius] = useState<number>(30);
  const [communeResults, setCommuneResults] = useState<ICommuneResult[]>([]);
  const [isLoadingCommunes, setIsLoadingCommunes] = useState<boolean>(false);

  // ── Save
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMsg, setSaveMsg] = useState<string>("");

  // ── Résultats calculés
  const [results, setResults] = useState<ISimulationResults | null>(null);

  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Init depuis budget + simulation sauvegardée
  useEffect(() => {
    getSimulation().catch(() => {});
  }, [getSimulation]);

  useEffect(() => {
    if (!dashboard) return;

    const count = dashboard.budget.nombrePersonnes || 1;
    const revenusSource = dashboard.details?.revenusParEntree &&
      Object.keys(dashboard.details.revenusParEntree).length >= count
      ? dashboard.details.revenusParEntree
      : null;

    const totalRevenus = dashboard.totaux.revenus;

    const newBorrowers: IBorrower[] = Array.from({ length: count }, (_, i) => {
      const names = Object.keys(revenusSource || {});
      const name = names[i] ? `${names[i]}` : `Personne ${i + 1}`;
      const revenue = revenusSource
        ? (Object.values(revenusSource)[i] as number) || totalRevenus / count
        : totalRevenus / count;

      return {
        name,
        status: (simulation?.borrowers?.[i]?.status as BorrowerStatus) || "CDI",
        revenue: Math.round(revenue),
      };
    });

    setBorrowers(newBorrowers);
    if (simulation) {
      setActiveScenario(simulation.activeScenario || "all_cdi");
      setLoanDuration(simulation.loanDuration || 20);
      setLoanRate(Number(simulation.loanRate) || 0.035);
      setInsuranceRate(Number(simulation.insuranceRate) || 0.003);
      setApport(Number(simulation.apport) || 0);
      setPropertyType((simulation.propertyType as PropertyType) || "ancien");
      setSearchRadius(simulation.searchRadius || 30);
      if (simulation.cityName && simulation.cityInsee && simulation.cityLat && simulation.cityLng) {
        setSelectedCity({
          nom: simulation.cityName,
          code: simulation.cityInsee,
          centre: {
            type: "Point",
            coordinates: [simulation.cityLng, simulation.cityLat],
          },
        });
        setCitySearch(simulation.cityName);
      }
    }
  }, [dashboard, simulation]);

  // ── Application d'un scénario
  const applyScenario = useCallback((scenario: IScenario) => {
    setActiveScenario(scenario.id);
    setBorrowers(prev =>
      prev.map((b, i) => ({
        ...b,
        status: scenario.statuses[i] ?? b.status,
      }))
    );
  }, []);

  // ── Calcul principal
  useEffect(() => {
    if (!dashboard) return;

    const eligibleRevenue = borrowers.reduce(
      (sum, b) => sum + b.revenue * STATUS_COEFFICIENT[b.status],
      0
    );

    // Loyer actuel dans les charges fixes catégorie Logement
    const loyerActuel = dashboard.details?.chargesFixesParCategorie?.["Logement"] || 0;

    // Dettes existantes (crédits) — hors loyer car il disparaît
    const existingDebts = dashboard.totaux.totalMensualitesDettes;

    // Capacité mensuelle pour le prêt (taux d'endettement 35%)
    const maxMonthlyPayment = Math.max(0, eligibleRevenue * 0.35 - existingDebts);

    // Montant empruntable
    const loanAmount = Math.max(0, calcMaxLoan(maxMonthlyPayment, loanRate, insuranceRate, loanDuration));
    const totalBudget = loanAmount + apport;

    // Frais notaire
    const notaryRate = propertyType === "neuf" ? 0.025 : 0.075;
    const propertyBudget = totalBudget / (1 + notaryRate);
    const notaryFees = totalBudget - propertyBudget;

    // Mensualité réelle
    const monthlyPayment = calcMonthlyPayment(loanAmount, loanRate, loanDuration);
    const monthlyInsurance = (loanAmount * insuranceRate) / 12;
    const totalMonthlyCharge = monthlyPayment + monthlyInsurance;

    // Coût total
    const totalCreditCost = totalMonthlyCharge * loanDuration * 12;
    const totalInterests = totalCreditCost - loanAmount;

    // Reste à vivre après remboursement (loyer remplacé par mensualité)
    const chargesHorsLoyer = dashboard.totaux.totalCharges - loyerActuel;
    const resteAVivreAfter = eligibleRevenue - chargesHorsLoyer - totalMonthlyCharge;
    const debtRatioAfter = eligibleRevenue > 0
      ? (existingDebts + totalMonthlyCharge) / eligibleRevenue
      : 0;

    const minSurface = Math.max(
      30,
      (dashboard.budget.nombrePersonnes || 1) * MIN_SURFACE_PER_PERSON +
      (dashboard.budget.nombreEnfants || 0) * MIN_SURFACE_PER_CHILD
    );

    setResults({
      eligibleRevenue,
      existingDebts,
      loyerActuel,
      maxMonthlyPayment,
      loanAmount,
      totalBudget,
      notaryFees,
      notaryRate,
      propertyBudget,
      monthlyPayment,
      monthlyInsurance,
      totalMonthlyCharge,
      totalCreditCost,
      totalInterests,
      resteAVivreAfter,
      debtRatioAfter,
      communes: communeResults.map(c => {
        if (c.avgPricePerM2) {
          const surface = Math.round(propertyBudget / c.avgPricePerM2);
          const idx = Math.min(100, Math.round((propertyBudget / (c.avgPricePerM2 * minSurface)) * 100));
          return {
            ...c,
            surfaceAchetable: surface,
            probabilityIndex: idx,
            probabilityLevel: probabilityLevel(idx),
          };
        }
        return c;
      }),
    });
  }, [dashboard, borrowers, loanDuration, loanRate, insuranceRate, apport, propertyType, communeResults]);

  // ── Autocomplétion ville
  const handleCitySearchChange = (value: string) => {
    setCitySearch(value);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    if (value.length < 2) { setCityResults([]); return; }
    searchDebounce.current = setTimeout(async () => {
      const data = await searchCommunesService(value);
      setCityResults(data);
    }, 300);
  };

  const handleSelectCity = (city: IGeoCommune) => {
    setSelectedCity(city);
    setCitySearch(city.nom);
    setCityResults([]);
  };

  // ── Recherche des communes dans le rayon
  const handleSearchCommunes = useCallback(async () => {
    if (!selectedCity?.centre) return;
    setIsLoadingCommunes(true);
    setCommuneResults([]);

    const [lon, lat] = selectedCity.centre.coordinates;

    try {
      const communes = await getCommunesInRadiusService(lat, lon, searchRadius);
      const withPrices = await Promise.all(
        communes.slice(0, 30).map(async c => {
          const prices = await getDvfPricesService(c.code);
          const surface = prices.avgPricePerM2 && results
            ? Math.round(results.propertyBudget / prices.avgPricePerM2)
            : null;
          const minSurface = Math.max(
            30,
            (dashboard?.budget.nombrePersonnes || 1) * MIN_SURFACE_PER_PERSON +
            (dashboard?.budget.nombreEnfants || 0) * MIN_SURFACE_PER_CHILD
          );
          const idx = prices.avgPricePerM2 && results
            ? Math.min(100, Math.round((results.propertyBudget / (prices.avgPricePerM2 * minSurface)) * 100))
            : 0;
          return {
            name: c.nom,
            insee: c.code,
            population: c.population || 0,
            distanceKm: c.distanceKm || 0,
            avgPricePerM2: prices.avgPricePerM2,
            transactionCount: prices.transactionCount,
            surfaceAchetable: surface,
            propertyBudgetLocal: results?.propertyBudget ?? null,
            probabilityIndex: idx,
            probabilityLevel: probabilityLevel(idx),
          } as ICommuneResult;
        })
      );
      setCommuneResults(withPrices.sort((a, b) => b.probabilityIndex - a.probabilityIndex));
    } finally {
      setIsLoadingCommunes(false);
    }
  }, [selectedCity, searchRadius, results, dashboard]);

  // ── Sauvegarde
  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveMsg("");
    try {
      const payload: Partial<IPretImmobilierFormData> = {
        borrowers,
        activeScenario,
        loanDuration,
        loanRate,
        insuranceRate,
        apport,
        propertyType,
        cityName: selectedCity?.nom || null,
        cityInsee: selectedCity?.code || null,
        cityLat: selectedCity?.centre ? selectedCity.centre.coordinates[1] : null,
        cityLng: selectedCity?.centre ? selectedCity.centre.coordinates[0] : null,
        searchRadius,
        simulationResults: results,
      };
      await upsertSimulation(payload);
      setSaveMsg("Simulation sauvegardee");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch {
      setSaveMsg("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const scenarios = generateScenarios(borrowers.length);

  if (!dashboard) return <></>;

  return (
    <section id="pretImmobilier" data-aos="fade-up" data-aos-delay="500">
      {/* ── En-tête ── */}
      <div className="pretHeader">
        <div className="pretHeaderLeft">
          <FiHome className="pretIcon" />
          <div>
            <h2 className="pretTitle">Simulateur de prêt immobilier</h2>
            <p className="pretSubtitle">
              Estimez votre capacité d'emprunt et analysez le marché local
            </p>
          </div>
        </div>
        <button
          type="button"
          className="saveBtn"
          onClick={handleSave}
          disabled={isSaving}
        >
          <FiSave />
          <span>{isSaving ? "Sauvegarde..." : "Sauvegarder"}</span>
        </button>
      </div>

      {saveMsg && (
        <p className={`saveMsg ${saveMsg.includes("Erreur") ? "error" : "success"}`}>
          {saveMsg}
        </p>
      )}

      <div className="pretGrid">
        {/* ════════════════════════════════════════════
            COLONNE GAUCHE — Profil + Paramètres
        ════════════════════════════════════════════ */}
        <div className="pretLeft">

          {/* ── Profil emprunteurs ── */}
          <div className="pretCard">
            <h3 className="cardTitle">
              <IoPersonOutline /> Profil des emprunteurs
            </h3>

            {/* Boutons scénarios */}
            <div className="scenariosRow">
              {scenarios.map(s => (
                <button
                  key={s.id}
                  type="button"
                  className={`scenarioBtn ${activeScenario === s.id ? "active" : ""}`}
                  onClick={() => applyScenario(s)}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Cartes emprunteurs */}
            <div className="borrowersGrid">
              {borrowers.map((b, i) => (
                <div key={i} className="borrowerCard">
                  <p className="borrowerName">{b.name}</p>
                  <div className="statusBtns">
                    {(["CDI", "CDD", "chomage"] as BorrowerStatus[]).map(s => (
                      <button
                        key={s}
                        type="button"
                        className={`statusBtn ${b.status === s ? `active ${s}` : ""}`}
                        onClick={() => {
                          setBorrowers(prev =>
                            prev.map((x, j) => j === i ? { ...x, status: s } : x)
                          );
                          setActiveScenario("custom");
                        }}
                      >
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                  <div className="revenueRow">
                    <label className="revenueLabel">Revenu mensuel net</label>
                    <input
                      type="number"
                      className="revenueInput"
                      value={b.revenue || ""}
                      min={0}
                      step={50}
                      onChange={e => setBorrowers(prev =>
                        prev.map((x, j) => j === i
                          ? { ...x, revenue: parseFloat(e.target.value) || 0 }
                          : x
                        )
                      )}
                    />
                    <span className="revenueSuffix">€ / mois</span>
                  </div>
                  {b.status !== "CDI" && (
                    <p className="statusWarning">
                      {b.status === "CDD"
                        ? "Revenus pris à 50% (politique bancaire conservative)"
                        : "Revenus exclus du calcul (chômage)"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Paramètres du prêt ── */}
          <div className="pretCard">
            <h3 className="cardTitle">Paramètres du prêt</h3>

            {/* Type de bien */}
            <div className="paramRow">
              <span className="paramLabel">Type de bien</span>
              <div className="toggleGroup">
                <button
                  type="button"
                  className={`toggleBtn ${propertyType === "ancien" ? "active" : ""}`}
                  onClick={() => setPropertyType("ancien")}
                >
                  Ancien <span className="toggleNote">(frais ~7,5%)</span>
                </button>
                <button
                  type="button"
                  className={`toggleBtn ${propertyType === "neuf" ? "active" : ""}`}
                  onClick={() => setPropertyType("neuf")}
                >
                  Neuf <span className="toggleNote">(frais ~2,5%)</span>
                </button>
              </div>
            </div>

            {/* Durée */}
            <div className="sliderRow">
              <div className="sliderHeader">
                <span className="sliderLabel">Durée d'emprunt</span>
                <span className="sliderValue">{loanDuration} ans</span>
              </div>
              <input
                type="range"
                className="slider"
                min={5} max={30} step={5}
                value={loanDuration}
                onChange={e => setLoanDuration(parseInt(e.target.value))}
              />
              <div className="sliderTicks">
                {[5, 10, 15, 20, 25, 30].map(v => (
                  <span key={v}>{v}</span>
                ))}
              </div>
            </div>

            {/* Taux d'intérêt */}
            <div className="sliderRow">
              <div className="sliderHeader">
                <span className="sliderLabel">Taux d'intérêt</span>
                <span className="sliderValue">{(loanRate * 100).toFixed(2)} %</span>
              </div>
              <input
                type="range"
                className="slider"
                min={0.5} max={8} step={0.05}
                value={loanRate * 100}
                onChange={e => setLoanRate(parseFloat(e.target.value) / 100)}
              />
              <div className="sliderHints">
                <span>0,5%</span>
                <span className="hint">Standard ~3,5%</span>
                <span>8%</span>
              </div>
            </div>

            {/* Taux assurance */}
            <div className="sliderRow">
              <div className="sliderHeader">
                <span className="sliderLabel">Taux assurance emprunteur</span>
                <span className="sliderValue">{(insuranceRate * 100).toFixed(2)} %</span>
              </div>
              <input
                type="range"
                className="slider"
                min={0.10} max={1.0} step={0.05}
                value={insuranceRate * 100}
                onChange={e => setInsuranceRate(parseFloat(e.target.value) / 100)}
              />
              <div className="sliderHints">
                <span>0,10%</span>
                <span className="hint">Standard ~0,30%</span>
                <span>1,00%</span>
              </div>
            </div>

            {/* Apport */}
            <div className="sliderRow">
              <div className="sliderHeader">
                <span className="sliderLabel">Apport personnel</span>
                <span className="sliderValue">{formatCurrency(apport)}</span>
              </div>
              <input
                type="range"
                className="slider"
                min={0}
                max={Math.max(200000, apport + 10000)}
                step={1000}
                value={apport}
                onChange={e => setApport(parseInt(e.target.value))}
              />
              <div className="apportInput">
                <input
                  type="number"
                  value={apport || ""}
                  min={0}
                  step={1000}
                  placeholder="0"
                  onChange={e => setApport(parseInt(e.target.value) || 0)}
                />
                <span>€</span>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════
            COLONNE DROITE — Résultats + Géo
        ════════════════════════════════════════════ */}
        <div className="pretRight">

          {/* ── Résultats de la simulation ── */}
          {results && (
            <div className="pretCard resultsCard">
              <h3 className="cardTitle">Résultats de la simulation</h3>

              <div className="resultsGrid">
                <div className="resultItem highlight">
                  <span className="resultLabel">Montant empruntable</span>
                  <span className="resultValue big">{formatCurrency(results.loanAmount)}</span>
                </div>
                <div className="resultItem highlight">
                  <span className="resultLabel">Budget total (avec apport)</span>
                  <span className="resultValue big">{formatCurrency(results.totalBudget)}</span>
                </div>
                <div className="resultItem">
                  <span className="resultLabel">Budget bien (hors frais notaire)</span>
                  <span className="resultValue">{formatCurrency(results.propertyBudget)}</span>
                </div>
                <div className="resultItem">
                  <span className="resultLabel">
                    Frais de notaire ({propertyType === "neuf" ? "~2,5%" : "~7,5%"})
                  </span>
                  <span className="resultValue secondary">{formatCurrency(results.notaryFees)}</span>
                </div>
              </div>

              <div className="divider" />

              <div className="resultsGrid">
                <div className="resultItem">
                  <span className="resultLabel">Mensualité hors assurance</span>
                  <span className="resultValue">{formatCurrency(results.monthlyPayment)}</span>
                </div>
                <div className="resultItem">
                  <span className="resultLabel">Assurance mensuelle</span>
                  <span className="resultValue">{formatCurrency(results.monthlyInsurance)}</span>
                </div>
                <div className="resultItem highlight">
                  <span className="resultLabel">Charge mensuelle totale</span>
                  <span className="resultValue">{formatCurrency(results.totalMonthlyCharge)}</span>
                </div>
                <div className="resultItem">
                  <span className="resultLabel">Loyer actuel remplacé</span>
                  <span className="resultValue success">
                    {results.loyerActuel > 0
                      ? `− ${formatCurrency(results.loyerActuel)}`
                      : "Non renseigné"}
                  </span>
                </div>
              </div>

              <div className="divider" />

              <div className="resultsGrid">
                <div className="resultItem">
                  <span className="resultLabel">Coût total du crédit</span>
                  <span className="resultValue">{formatCurrency(results.totalCreditCost)}</span>
                </div>
                <div className="resultItem">
                  <span className="resultLabel">dont intérêts totaux</span>
                  <span className="resultValue secondary">{formatCurrency(results.totalInterests)}</span>
                </div>
                <div className={`resultItem ${results.resteAVivreAfter >= 0 ? "positive" : "negative"}`}>
                  <span className="resultLabel">Reste à vivre après remboursement</span>
                  <span className="resultValue">{formatCurrency(results.resteAVivreAfter)}</span>
                </div>
                <div className={`resultItem ${results.debtRatioAfter > 0.35 ? "negative" : "positive"}`}>
                  <span className="resultLabel">Taux d'endettement final</span>
                  <span className="resultValue">{formatPct(results.debtRatioAfter)}</span>
                  {results.debtRatioAfter > 0.35 && (
                    <span className="resultWarn">
                      <FiInfo /> Dépasse le seuil légal de 35%
                    </span>
                  )}
                </div>
              </div>

              {/* Comparaison mensualité vs loyer */}
              {results.loyerActuel > 0 && (
                <div className="loyerComparison">
                  <p className="loyerTitle">Comparaison loyer → mensualité</p>
                  <div className="loyerBars">
                    <div className="loyerBar">
                      <span className="loyerBarLabel">Loyer actuel</span>
                      <div className="barTrack">
                        <div
                          className="barFill loyer"
                          style={{ width: `${Math.min(100, (results.loyerActuel / results.totalMonthlyCharge) * 100)}%` }}
                        />
                      </div>
                      <span className="loyerBarValue">{formatCurrency(results.loyerActuel)}</span>
                    </div>
                    <div className="loyerBar">
                      <span className="loyerBarLabel">Mensualité prêt</span>
                      <div className="barTrack">
                        <div className="barFill mensualite" style={{ width: "100%" }} />
                      </div>
                      <span className="loyerBarValue">{formatCurrency(results.totalMonthlyCharge)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Recherche géographique ── */}
          <div className="pretCard geoCard">
            <h3 className="cardTitle">
              <FiSearch /> Analyse du marché local
            </h3>

            {/* Recherche ville */}
            <div className="citySearchRow">
              <div className="cityInputWrapper">
                <input
                  type="text"
                  className="cityInput"
                  placeholder="Rechercher une ville..."
                  value={citySearch}
                  onChange={e => handleCitySearchChange(e.target.value)}
                  autoComplete="off"
                />
                {cityResults.length > 0 && (
                  <ul className="citySuggestions">
                    {cityResults.map(c => (
                      <li
                        key={c.code}
                        className="citySuggestion"
                        onClick={() => handleSelectCity(c)}
                      >
                        <span className="cityName">{c.nom}</span>
                        <span className="cityInfo">
                          {c.codesPostaux?.[0]} · {c.codeDepartement}
                          {c.population ? ` · ${c.population.toLocaleString("fr-FR")} hab.` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Rayon */}
              <div className="radiusRow">
                {RADIUS_OPTIONS.map(r => (
                  <button
                    key={r}
                    type="button"
                    className={`radiusBtn ${searchRadius === r ? "active" : ""}`}
                    onClick={() => setSearchRadius(r)}
                  >
                    {r} km
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="searchBtn"
                onClick={handleSearchCommunes}
                disabled={!selectedCity || isLoadingCommunes || !results}
              >
                {isLoadingCommunes ? "Analyse en cours..." : "Analyser"}
              </button>
            </div>

            {/* Résultats communes */}
            {isLoadingCommunes && (
              <p className="loadingText">
                Récupération des données DVF et des communes...
              </p>
            )}

            {communeResults.length > 0 && (
              <div className="communesTable">
                <div className="communesHeader">
                  <span>Commune</span>
                  <span>Distance</span>
                  <span>Prix m²</span>
                  <span>Surface</span>
                  <span>Probabilité</span>
                </div>
                {communeResults.map(c => (
                  <div key={c.insee} className="communeRow">
                    <div className="communeNameCell">
                      <span className="communeName">{c.name}</span>
                      {c.population > 0 && (
                        <span className="communePop">
                          {c.population.toLocaleString("fr-FR")} hab.
                        </span>
                      )}
                    </div>
                    <span className="communeDistance">{c.distanceKm} km</span>
                    <span className="communePrice">
                      {c.avgPricePerM2
                        ? `${c.avgPricePerM2.toLocaleString("fr-FR")} €/m²`
                        : <span className="noData">—</span>
                      }
                      {c.transactionCount > 0 && (
                        <span className="txCount">({c.transactionCount} tx)</span>
                      )}
                    </span>
                    <span className="communeSurface">
                      {c.surfaceAchetable ? `~${c.surfaceAchetable} m²` : "—"}
                    </span>
                    <div className="probabilityCell">
                      <span className={`probabilityBadge ${c.probabilityLevel}`}>
                        {c.probabilityLevel === "excellent" && "Excellent"}
                        {c.probabilityLevel === "bon" && "Bon"}
                        {c.probabilityLevel === "modere" && "Modéré"}
                        {c.probabilityLevel === "faible" && "Faible"}
                        <span className="probabilityPct"> {c.probabilityIndex}%</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoadingCommunes && communeResults.length === 0 && selectedCity && (
              <p className="noResultsText">
                Sélectionnez un rayon et cliquez sur "Analyser" pour voir les résultats.
              </p>
            )}

            {!selectedCity && (
              <p className="noResultsText">
                Recherchez une ville pour analyser les prix immobiliers à proximité.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default PretImmobilier;
