import { IBudgetDashboard } from "../types/budget.types.ts";

export interface ChartEntry {
  name: string;
  value: number;
}

export interface BarEntry {
  name: string;
  montant: number;
}

/**
 * Données du graphique en secteurs : répartition des charges.
 */
export const buildChargesChartData = (
  dashboard: IBudgetDashboard
): ChartEntry[] =>
  [
    { name: "Charges fixes", value: dashboard.totaux.chargesFixes },
    { name: "Charges variables", value: dashboard.totaux.chargesVariables },
    { name: "Dettes", value: dashboard.totaux.totalMensualitesDettes },
  ].filter((d) => d.value > 0);

/**
 * Données du graphique en secteurs : répartition des revenus.
 * Si le foyer compte ≥ 2 personnes avec des entrées individuelles, affiche
 * par entrée ; sinon par catégorie.
 */
export const buildRevenusChartData = (
  dashboard: IBudgetDashboard
): ChartEntry[] => {
  const usePerEntry =
    dashboard.budget.nombrePersonnes >= 2 &&
    dashboard.details?.revenusParEntree &&
    Object.keys(dashboard.details.revenusParEntree).length > 1;

  const source = usePerEntry
    ? dashboard.details.revenusParEntree
    : dashboard.details?.revenusParCategorie;

  if (!source) return [];

  return Object.entries(source)
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0);
};

/**
 * Données du graphique en barres : détail des charges fixes par catégorie.
 */
export const buildBarChartData = (dashboard: IBudgetDashboard): BarEntry[] =>
  Object.entries(dashboard.details?.chargesFixesParCategorie ?? {}).map(
    ([name, montant]) => ({ name, montant })
  );
