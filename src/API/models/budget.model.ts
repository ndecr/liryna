import { IBudget, IBudgetEntry, IBudgetDebt } from "../../utils/types/budget.types";

export const budgetEntryModel = (entry: IBudgetEntry): IBudgetEntry => {
  return {
    id: entry.id,
    budgetId: entry.budgetId,
    section: entry.section,
    category: entry.category,
    label: entry.label,
    amount: Number(entry.amount),
    sortOrder: entry.sortOrder,
    created_at: entry.created_at,
    updated_at: entry.updated_at,
  };
};

export const budgetDebtModel = (debt: IBudgetDebt): IBudgetDebt => {
  return {
    id: debt.id,
    budgetId: debt.budgetId,
    type: debt.type,
    organisme: debt.organisme,
    mensualite: Number(debt.mensualite),
    sortOrder: debt.sortOrder,
    created_at: debt.created_at,
    updated_at: debt.updated_at,
  };
};

export const budgetModel = (budget: IBudget): IBudget => {
  return {
    id: budget.id,
    userId: budget.userId,
    nombrePersonnes: budget.nombrePersonnes,
    notes: budget.notes,
    entries: budget.entries ? budget.entries.map(budgetEntryModel) : [],
    debts: budget.debts ? budget.debts.map(budgetDebtModel) : [],
    created_at: budget.created_at,
    updated_at: budget.updated_at,
  };
};
