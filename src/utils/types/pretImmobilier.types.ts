export type BorrowerStatus = 'CDI' | 'CDD' | 'chomage';
export type PropertyType = 'ancien' | 'neuf';
export type ProbabilityLevel = 'faible' | 'modere' | 'bon' | 'excellent';

export interface IBorrower {
  name: string;
  status: BorrowerStatus;
  revenue: number; // mensuel net
}

export interface IScenario {
  id: string;
  label: string;
  statuses: BorrowerStatus[];
}

export interface ICommuneResult {
  name: string;
  insee: string;
  population: number;
  distanceKm: number;
  avgPricePerM2: number | null;
  transactionCount: number;
  surfaceAchetable: number | null;
  propertyBudgetLocal: number | null;
  probabilityIndex: number;
  probabilityLevel: ProbabilityLevel;
}

export interface ISimulationResults {
  // Revenus
  eligibleRevenue: number;
  // Capacité
  existingDebts: number;
  loyerActuel: number;
  maxMonthlyPayment: number;
  // Prêt
  loanAmount: number;
  totalBudget: number;
  notaryFees: number;
  notaryRate: number;
  propertyBudget: number;
  // Mensualités
  monthlyPayment: number;
  monthlyInsurance: number;
  totalMonthlyCharge: number;
  // Coût total
  totalCreditCost: number;
  totalInterests: number;
  // Viabilité
  currentDebtRatio: number;
  resteAVivreAfter: number;
  debtRatioAfter: number;
  // Communes
  communes: ICommuneResult[];
}

export interface IPretImmobilier {
  id: number;
  budgetId: number;
  userId: number;
  borrowers: IBorrower[];
  activeScenario: string;
  loanDuration: number;
  loanRate: number;
  insuranceRate: number;
  apport: number;
  propertyType: PropertyType;
  cityName: string | null;
  cityInsee: string | null;
  cityLat: number | null;
  cityLng: number | null;
  searchRadius: number;
  simulationResults: ISimulationResults | null;
  created_at?: string;
  updated_at?: string;
}

export interface IPretImmobilierFormData {
  borrowers: IBorrower[];
  activeScenario: string;
  loanDuration: number;
  loanRate: number;
  insuranceRate: number;
  apport: number;
  propertyType: PropertyType;
  cityName: string | null;
  cityInsee: string | null;
  cityLat: number | null;
  cityLng: number | null;
  searchRadius: number;
  simulationResults: ISimulationResults | null;
}

export interface IGeoCommune {
  nom: string;
  code: string;
  codesPostaux?: string[];
  codeDepartement?: string;
  population?: number;
  centre?: {
    type: string;
    coordinates: [number, number]; // [lon, lat]
  };
  distanceKm?: number;
}

export interface IDvfPriceData {
  avgPricePerM2: number | null;
  transactionCount: number;
}
