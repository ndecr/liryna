import {
  IBudget,
  IBudgetFormData,
  IBudgetDashboard
} from "../../utils/types/budget.types.ts";
import { createContext, Context } from "react";

interface IBudgetContext {
  currentBudget: IBudget | null;
  dashboard: IBudgetDashboard | null;
  isLoading: boolean;
  setCurrentBudget: (budget: IBudget | null) => void;
  createBudget: (formData: IBudgetFormData) => Promise<IBudget>;
  getMyBudget: () => Promise<void>;
  updateBudget: (id: number, formData: Partial<IBudgetFormData>) => Promise<IBudget>;
  deleteBudget: (id: number) => Promise<void>;
  getBudgetDashboard: () => Promise<void>;
}

export const BudgetContext: Context<IBudgetContext> = createContext<IBudgetContext>({
  currentBudget: null,
  dashboard: null,
  isLoading: false,
  setCurrentBudget: (): void => {},
  createBudget: async (): Promise<IBudget> => { throw new Error("Context not initialized"); },
  getMyBudget: async (): Promise<void> => {},
  updateBudget: async (): Promise<IBudget> => { throw new Error("Context not initialized"); },
  deleteBudget: async (): Promise<void> => {},
  getBudgetDashboard: async (): Promise<void> => {},
});
