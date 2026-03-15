import { IBudgetDashboard } from "../types/budget.types.ts";
import {
  IBorrower,
  BorrowerStatus,
  PropertyType,
  ICommuneResult,
  ISimulationResults,
  ProbabilityLevel,
} from "../types/pretImmobilier.types.ts";

// ─── Constantes ───────────────────────────────────────────────────────────────

export const STATUS_COEFFICIENT: Record<BorrowerStatus, number> = {
  CDI: 1.0,
  CDD: 0.5,
  chomage: 0.0,
};

export const MIN_SURFACE_PER_PERSON = 25;
export const MIN_SURFACE_PER_CHILD = 10;

// ─── Fonctions pures de calcul ────────────────────────────────────────────────

/**
 * Calcule le montant maximum empruntable à partir d'une capacité mensuelle.
 * Utilise la formule actuarielle standard (amortissement constant).
 */
export const calcMaxLoan = (
  monthlyPaymentCapacity: number,
  annualLoanRate: number,
  annualInsuranceRate: number,
  years: number
): number => {
  const r = annualLoanRate / 12;
  const n = years * 12;
  const ins = annualInsuranceRate / 12;
  if (r === 0 && ins === 0) return monthlyPaymentCapacity * n;
  const divisor =
    r > 0 ? r / (1 - Math.pow(1 + r, -n)) + ins : ins;
  return monthlyPaymentCapacity / divisor;
};

/**
 * Calcule la mensualité hors assurance pour un prêt donné.
 */
export const calcMonthlyPayment = (
  principal: number,
  annualLoanRate: number,
  years: number
): number => {
  const r = annualLoanRate / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
};

/**
 * Détermine le niveau de probabilité d'achat à partir d'un indice 0-100.
 */
export const calcProbabilityLevel = (index: number): ProbabilityLevel => {
  if (index >= 80) return "excellent";
  if (index >= 50) return "bon";
  if (index >= 25) return "modere";
  return "faible";
};

/**
 * Calcule la surface minimale requise selon le foyer.
 */
export const calcMinSurface = (
  nombrePersonnes: number,
  nombreEnfants: number
): number =>
  Math.max(
    30,
    nombrePersonnes * MIN_SURFACE_PER_PERSON +
      nombreEnfants * MIN_SURFACE_PER_CHILD
  );

// ─── Calcul principal ─────────────────────────────────────────────────────────

export interface SimulationInput {
  dashboard: IBudgetDashboard;
  borrowers: IBorrower[];
  loanDuration: number;
  loanRate: number;
  insuranceRate: number;
  apport: number;
  propertyType: PropertyType;
  communeResults: ICommuneResult[];
}

/**
 * Calcul pur de la simulation immobilière à partir des paramètres fournis.
 * Ne produit aucun effet de bord.
 */
export const calculateSimulation = (input: SimulationInput): ISimulationResults => {
  const {
    dashboard,
    borrowers,
    loanDuration,
    loanRate,
    insuranceRate,
    apport,
    propertyType,
    communeResults,
  } = input;

  const eligibleRevenue = borrowers.reduce(
    (sum, b) => sum + b.revenue * STATUS_COEFFICIENT[b.status],
    0
  );

  const loyerActuel =
    dashboard.details?.chargesFixesParCategorie?.["Logement"] || 0;
  const existingDebts = dashboard.totaux.totalMensualitesDettes;

  const maxMonthlyPayment = Math.max(
    0,
    eligibleRevenue * 0.35 - existingDebts
  );

  const loanAmount = Math.max(
    0,
    calcMaxLoan(maxMonthlyPayment, loanRate, insuranceRate, loanDuration)
  );
  const totalBudget = loanAmount + apport;

  const notaryRate = propertyType === "neuf" ? 0.025 : 0.075;
  const propertyBudget = totalBudget / (1 + notaryRate);
  const notaryFees = totalBudget - propertyBudget;

  const monthlyPayment = calcMonthlyPayment(loanAmount, loanRate, loanDuration);
  const monthlyInsurance = (loanAmount * insuranceRate) / 12;
  const totalMonthlyCharge = monthlyPayment + monthlyInsurance;

  const totalCreditCost = totalMonthlyCharge * loanDuration * 12;
  const totalInterests = totalCreditCost - loanAmount;

  const chargesHorsLoyer = dashboard.totaux.totalCharges - loyerActuel;
  const resteAVivreAfter =
    eligibleRevenue - chargesHorsLoyer - totalMonthlyCharge;
  const currentDebtRatio =
    eligibleRevenue > 0 ? existingDebts / eligibleRevenue : 0;
  const debtRatioAfter =
    eligibleRevenue > 0
      ? (existingDebts + totalMonthlyCharge) / eligibleRevenue
      : 0;

  const minSurface = calcMinSurface(
    dashboard.budget.nombrePersonnes || 1,
    dashboard.budget.nombreEnfants || 0
  );

  const communes = communeResults.map((c) => {
    if (c.avgPricePerM2) {
      const surface = Math.round(propertyBudget / c.avgPricePerM2);
      const idx = Math.min(
        100,
        Math.round((propertyBudget / (c.avgPricePerM2 * minSurface)) * 100)
      );
      return {
        ...c,
        surfaceAchetable: surface,
        probabilityIndex: idx,
        probabilityLevel: calcProbabilityLevel(idx),
      };
    }
    return c;
  });

  return {
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
    currentDebtRatio,
    resteAVivreAfter,
    debtRatioAfter,
    communes,
  };
};
