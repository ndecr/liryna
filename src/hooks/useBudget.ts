import { useContext } from "react";
import { BudgetContext } from "../context/budget/BudgetContext.tsx";

export const useBudget = () => {
  return useContext(BudgetContext);
};
