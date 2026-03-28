// styles
import "./pretImmobilier.scss";

// hooks | libraries
import { ReactElement, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiSave, FiSearch, FiInfo } from "react-icons/fi";
import { IoPersonOutline } from "react-icons/io5";
import { MdArrowBack } from "react-icons/md";

// components
import WithAuth from "../../../utils/middleware/WithAuth.tsx";
import Header from "../../../components/header/Header.tsx";
import SubNav from "../../../components/subNav/SubNav.tsx";
import Button from "../../../components/button/Button.tsx";
import Loader from "../../../components/loader/Loader.tsx";

// hooks
import { useBudget } from "../../../hooks/useBudget.ts";
import { usePretImmobilier } from "../../../hooks/usePretImmobilier.ts";

// services
import {
  searchCommunesService,
  getCommunesInRadiusService,
  getDvfPricesService
} from "../../../API/services/pretImmobilier.service.ts";
import {
  calculateSimulation,
  calcMinSurface,
  calcProbabilityLevel,
} from "../../../utils/services/pretImmobilierCalculator.service.ts";
import { formatCurrency, formatPct } from "../../../utils/helpers/formatters.ts";

// types
import {
  IBorrower,
  BorrowerStatus,
  PropertyType,
  ICommuneResult,
  IGeoCommune,
  IPretImmobilierFormData
} from "../../../utils/types/pretImmobilier.types.ts";

// ─── Constantes ──────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<BorrowerStatus, string> = {
  CDI: "CDI",
  CDD: "CDD",
  chomage: "Chômage",
};

const RADIUS_OPTIONS = [5, 10, 30, 50, 100];

// ─── Composant ───────────────────────────────────────────────────────────────

function PretImmobilier(): ReactElement {
  const navigate = useNavigate();
  const { dashboard, isLoading: isBudgetLoading, getBudgetDashboard } = useBudget();
  const { simulation, getSimulation, upsertSimulation } = usePretImmobilier();

  // ── Borrowers
  const [borrowers, setBorrowers] = useState<IBorrower[]>([]);

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
  const [geoError, setGeoError] = useState<string>("");

  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Chargement dashboard si absent
  useEffect(() => {
    if (!dashboard && !isBudgetLoading) {
      getBudgetDashboard().catch(() => {});
    }
  }, [dashboard, isBudgetLoading, getBudgetDashboard]);

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

  // ── Calcul principal (dérivé pur, pas d'effet de bord)
  const results = useMemo(() => {
    if (!dashboard) return null;
    return calculateSimulation({
      dashboard,
      borrowers,
      loanDuration,
      loanRate,
      insuranceRate,
      apport,
      propertyType,
      communeResults,
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
    setGeoError("");

    const [lon, lat] = selectedCity.centre.coordinates;

    try {
      const communes = await getCommunesInRadiusService(lat, lon, searchRadius);

      if (communes.length === 0) {
        setGeoError("Aucune commune trouvée dans ce rayon.");
        return;
      }

      const minSurface = calcMinSurface(
        dashboard?.budget.nombrePersonnes || 1,
        dashboard?.budget.nombreEnfants || 0
      );

      const settledPrices = await Promise.allSettled(
        communes.slice(0, 30).map(c => getDvfPricesService(c.code))
      );

      const withPrices: ICommuneResult[] = communes.slice(0, 30).map((c, i) => {
        const priceResult = settledPrices[i];
        const prices = priceResult.status === "fulfilled"
          ? priceResult.value
          : { avgPricePerM2: null, transactionCount: 0 };

        const surface = prices.avgPricePerM2 && results
          ? Math.round(results.propertyBudget / prices.avgPricePerM2)
          : null;
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
          probabilityLevel: calcProbabilityLevel(idx),
        };
      });

      setCommuneResults(withPrices.sort((a, b) => b.probabilityIndex - a.probabilityIndex));
    } catch (error) {
      console.error("Erreur analyse communes:", error);
      setGeoError("Erreur lors de la récupération des communes. Veuillez réessayer.");
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

  if (isBudgetLoading) {
    return (
      <>
        <Header />
        <SubNav />
        <main id="pretImmobilier">
          <Loader size="large" />
        </main>
      </>
    );
  }

  if (!dashboard) {
    return (
      <>
        <Header />
        <SubNav />
        <main id="pretImmobilier">
          <div className="pretContainer">
            <Button style="back" onClick={() => navigate("/budget")} type="button">
              <MdArrowBack />
              <span>Retour</span>
            </Button>
            <div className="pretNoBudget">
              <FiHome className="pretNoBudgetIcon" />
              <p className="pretNoBudgetTitle">Aucun budget configuré</p>
              <p className="pretNoBudgetText">
                Le simulateur de prêt immobilier nécessite un budget configuré pour calculer ta capacité d'emprunt.
              </p>
              <Button style="orange" onClick={() => navigate("/budget/edit")} type="button">
                Configurer mon budget
              </Button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <SubNav />
      <main id="pretImmobilier">
      <div className="pretContainer">
      {/* ── En-tête ── */}
      <div className="pretHeader" data-aos="fade-down">
        <Button style="back" onClick={() => navigate("/budget")} type="button">
          <MdArrowBack />
          <span>Retour</span>
        </Button>
        <div className="pretHeaderCenter">
          <FiHome className="pretIcon" />
          <div>
            <h1 className="pretTitle">Simulateur de prêt immobilier</h1>
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
              <p className="propertyLegend">
                {propertyType === "ancien"
                  ? "Bien ayant déjà été possédé ou achevé depuis + de 5 ans. S'applique à la grande majorité des transactions immobilières."
                  : "Construction neuve ou achat en VEFA (sur plan), jamais occupé, achevé depuis moins de 5 ans. Frais de notaire réduits car moins de taxes de mutation."}
              </p>
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

              {/* Détail du calcul */}
              <div className="loanBreakdown">
                <p className="loanBreakdownTitle"><FiInfo /> Comment est calculé le montant empruntable ?</p>
                <div className="loanBreakdownSteps">
                  <div className="loanStep">
                    <span className="loanStepLabel">Revenus éligibles</span>
                    <span className="loanStepValue">{formatCurrency(results.eligibleRevenue)} / mois</span>
                  </div>
                  <div className="loanStep operator">
                    <span className="loanStepLabel">× 35% (seuil légal d'endettement)</span>
                    <span className="loanStepValue">{formatCurrency(results.eligibleRevenue * 0.35)} / mois</span>
                  </div>
                  <div className="loanStep operator">
                    <span className="loanStepLabel">− Crédits en cours</span>
                    <span className="loanStepValue">− {formatCurrency(results.existingDebts)} / mois</span>
                  </div>
                  <div className="loanStep result">
                    <span className="loanStepLabel">= Capacité mensuelle pour le prêt</span>
                    <span className="loanStepValue">{formatCurrency(results.maxMonthlyPayment)} / mois</span>
                  </div>
                  <div className="loanStep result">
                    <span className="loanStepLabel">→ Montant empruntable (formule actuarielle, {loanDuration} ans)</span>
                    <span className="loanStepValue">{formatCurrency(results.loanAmount)}</span>
                  </div>
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
                <div className="resultItem">
                  <span className="resultLabel">Taux d'endettement actuel</span>
                  <span className="resultValue secondary">{formatPct(results.currentDebtRatio)}</span>
                </div>
                <div className={`resultItem ${results.debtRatioAfter > 0.35 ? "negative" : "positive"}`}>
                  <span className="resultLabel">Taux d'endettement après prêt</span>
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
            {geoError && (
              <p className="geoErrorText">{geoError}</p>
            )}

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
      </div>
    </main>
  </>
  );
}

const PretImmobilierWithAuth = WithAuth(PretImmobilier);
export default PretImmobilierWithAuth;
