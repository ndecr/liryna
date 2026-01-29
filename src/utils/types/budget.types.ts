export type BudgetSection = 'revenus' | 'charges_fixes' | 'charges_variables';

export interface IBudgetEntry {
  id: number;
  budgetId: number;
  section: BudgetSection;
  category: string | null;
  label: string;
  amount: number;
  sortOrder: number;
  created_at?: string;
  updated_at?: string;
}

export interface IBudgetDebt {
  id: number;
  budgetId: number;
  type: string;
  organisme: string;
  mensualite: number;
  sortOrder: number;
  created_at?: string;
  updated_at?: string;
}

export interface IBudget {
  id: number;
  userId: number;
  nombrePersonnes: number;
  notes: string | null;
  entries: IBudgetEntry[];
  debts: IBudgetDebt[];
  created_at?: string;
  updated_at?: string;
}

export interface IBudgetEntryFormData {
  section: BudgetSection;
  category: string;
  label: string;
  amount: number;
  sortOrder: number;
}

export interface IBudgetDebtFormData {
  type: string;
  organisme: string;
  mensualite: number;
  sortOrder: number;
}

export interface IBudgetFormData {
  nombrePersonnes: number;
  notes: string;
  entries: IBudgetEntryFormData[];
  debts: IBudgetDebtFormData[];
}

export interface IBudgetDashboardTotaux {
  revenus: number;
  chargesFixes: number;
  chargesVariables: number;
  totalMensualitesDettes: number;
  totalCharges: number;
  resteAVivre: number;
  resteAVivreParPersonne: number;
}

export interface IBudgetDashboardIndicateurs {
  tauxEndettement: number;
  ratioChargesRevenus: number;
}

export interface IBudgetRecommandation {
  level: 'success' | 'warning' | 'danger';
  message: string;
}

export interface IBudgetDashboard {
  budget: {
    id: number;
    nombrePersonnes: number;
    notes: string | null;
  };
  totaux: IBudgetDashboardTotaux;
  indicateurs: IBudgetDashboardIndicateurs;
  recommandation: IBudgetRecommandation;
  details: {
    chargesFixesParCategorie: Record<string, number>;
    revenusParCategorie: Record<string, number>;
  };
}
