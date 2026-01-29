import { useState, useMemo, useCallback, ReactElement } from "react";
import { BudgetContext } from "./BudgetContext.tsx";
import {
  IBudget,
  IBudgetFormData,
  IBudgetDashboard
} from "../../utils/types/budget.types.ts";
import {
  createBudgetService,
  getMyBudgetService,
  updateBudgetService,
  deleteBudgetService,
  getBudgetDashboardService
} from "../../API/services/budget.service.ts";

export const BudgetProvider = ({
  children,
}: {
  children: ReactElement;
}): ReactElement => {
  const [currentBudget, setCurrentBudget] = useState<IBudget | null>(null);
  const [dashboard, setDashboard] = useState<IBudgetDashboard | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const createBudget = useCallback(async (formData: IBudgetFormData): Promise<IBudget> => {
    setIsLoading(true);
    try {
      const newBudget = await createBudgetService(formData);
      setCurrentBudget(newBudget);
      return newBudget;
    } catch (error) {
      console.error("Error while creating budget:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMyBudget = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const budget = await getMyBudgetService();
      setCurrentBudget(budget);
    } catch (error) {
      console.error("Error while getting budget:", error);
      setCurrentBudget(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBudget = useCallback(async (id: number, formData: Partial<IBudgetFormData>): Promise<IBudget> => {
    setIsLoading(true);
    try {
      const updatedBudget = await updateBudgetService(id, formData);
      setCurrentBudget(updatedBudget);
      return updatedBudget;
    } catch (error) {
      console.error("Error while updating budget:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteBudget = useCallback(async (id: number): Promise<void> => {
    setIsLoading(true);
    try {
      await deleteBudgetService(id);
      setCurrentBudget(null);
      setDashboard(null);
    } catch (error) {
      console.error("Error while deleting budget:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getBudgetDashboard = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const data = await getBudgetDashboardService();
      setDashboard(data);
    } catch (error) {
      console.error("Error while getting budget dashboard:", error);
      setDashboard(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      currentBudget,
      dashboard,
      isLoading,
      setCurrentBudget,
      createBudget,
      getMyBudget,
      updateBudget,
      deleteBudget,
      getBudgetDashboard,
    }),
    [currentBudget, dashboard, isLoading, createBudget, getMyBudget, updateBudget, deleteBudget, getBudgetDashboard],
  );

  return (
    <BudgetContext.Provider value={contextValue}>
      {children}
    </BudgetContext.Provider>
  );
};
