import { getRequest, postRequest, patchRequest, deleteRequest } from "../APICalls.ts";
import { AxiosResponse } from "axios";
import {
  IBudget,
  IBudgetFormData,
  IBudgetDashboard
} from "../../utils/types/budget.types.ts";
import { budgetModel } from "../models/budget.model.ts";

interface IApiResponseGeneric<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export const createBudgetService = async (
  formData: IBudgetFormData
): Promise<IBudget> => {
  const response: AxiosResponse<IApiResponseGeneric<IBudget>> = await postRequest(
    "/budgets",
    formData
  );

  if (response.data.success && response.data.data) {
    return budgetModel(response.data.data);
  }

  throw new Error(response.data.message || "Erreur lors de la creation du budget");
};

export const getMyBudgetService = async (): Promise<IBudget> => {
  const response: AxiosResponse<IApiResponseGeneric<IBudget>> = await getRequest("/budgets");

  if (response.data.success && response.data.data) {
    return budgetModel(response.data.data);
  }

  throw new Error(response.data.message || "Erreur lors de la recuperation du budget");
};

export const updateBudgetService = async (
  id: number,
  formData: Partial<IBudgetFormData>
): Promise<IBudget> => {
  const response: AxiosResponse<IApiResponseGeneric<IBudget>> = await patchRequest(
    `/budgets/${id}`,
    formData
  );

  if (response.data.success && response.data.data) {
    return budgetModel(response.data.data);
  }

  throw new Error(response.data.message || "Erreur lors de la mise a jour du budget");
};

export const deleteBudgetService = async (id: number): Promise<void> => {
  const response: AxiosResponse<IApiResponseGeneric> = await deleteRequest(`/budgets/${id}`);

  if (!response.data.success) {
    throw new Error(response.data.message || "Erreur lors de la suppression du budget");
  }
};

export const getBudgetDashboardService = async (): Promise<IBudgetDashboard> => {
  const response: AxiosResponse<IApiResponseGeneric<IBudgetDashboard>> = await getRequest(
    "/budgets/dashboard"
  );

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || "Erreur lors de la recuperation du dashboard");
};
