import { createContext, Context } from "react";
import { IPretImmobilier, IPretImmobilierFormData } from "../../utils/types/pretImmobilier.types.ts";

interface IPretImmobilierContext {
  simulation: IPretImmobilier | null;
  isLoading: boolean;
  getSimulation: () => Promise<void>;
  upsertSimulation: (formData: Partial<IPretImmobilierFormData>) => Promise<IPretImmobilier>;
}

export const PretImmobilierContext: Context<IPretImmobilierContext> =
  createContext<IPretImmobilierContext>({
    simulation: null,
    isLoading: false,
    getSimulation: async () => {},
    upsertSimulation: async () => { throw new Error("Context not initialized"); },
  });
