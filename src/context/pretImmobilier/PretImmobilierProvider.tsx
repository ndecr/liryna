import { useState, useMemo, useCallback, ReactElement } from "react";
import { PretImmobilierContext } from "./PretImmobilierContext.tsx";
import { IPretImmobilier, IPretImmobilierFormData } from "../../utils/types/pretImmobilier.types.ts";
import {
  getSimulationService,
  upsertSimulationService
} from "../../API/services/pretImmobilier.service.ts";

export const PretImmobilierProvider = ({
  children,
}: {
  children: ReactElement;
}): ReactElement => {
  const [simulation, setSimulation] = useState<IPretImmobilier | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getSimulation = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const data = await getSimulationService();
      setSimulation(data);
    } catch {
      setSimulation(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const upsertSimulation = useCallback(
    async (formData: Partial<IPretImmobilierFormData>): Promise<IPretImmobilier> => {
      setIsLoading(true);
      try {
        const data = await upsertSimulationService(formData);
        setSimulation(data);
        return data;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const contextValue = useMemo(
    () => ({ simulation, isLoading, getSimulation, upsertSimulation }),
    [simulation, isLoading, getSimulation, upsertSimulation]
  );

  return (
    <PretImmobilierContext.Provider value={contextValue}>
      {children}
    </PretImmobilierContext.Provider>
  );
};
