import { getRequest, patchRequest } from "../APICalls.ts";
import { AxiosResponse } from "axios";
import {
  IProgrammeModule,
  IProgrammeSong,
  IProgrammeProgression,
  IProgrammeProgressionFormData,
} from "../../utils/types/musique.types.ts";
import {
  programmeModuleModel,
  programmeProgressionModel,
} from "../models/metalGuitare.model.ts";

interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

const STORAGE_KEY_MODULE = (slug: string) => `liryna_module_${slug}`;
const STORAGE_KEY_PROGRESSION = (slug: string) => `liryna_progression_${slug}`;

const loadFromStorage = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    // ignore
  }
  return null;
};

const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
};

export const getModuleSongsService = async (moduleSlug: string): Promise<IProgrammeModule> => {
  try {
    const response: AxiosResponse<IApiResponse<IProgrammeModule>> = await getRequest(
      `/musique/modules/${moduleSlug}`
    );
    if (response.data.success && response.data.data) {
      const module = programmeModuleModel(response.data.data);
      saveToStorage(STORAGE_KEY_MODULE(moduleSlug), module);
      return module;
    }
    throw new Error(response.data.message || "Erreur lors de la récupération du module");
  } catch {
    const cached = loadFromStorage<IProgrammeModule>(STORAGE_KEY_MODULE(moduleSlug));
    if (cached) return programmeModuleModel(cached);
    return programmeModuleModel({});
  }
};

export const getProgressionService = async (
  moduleSlug: string
): Promise<IProgrammeProgression> => {
  try {
    const response: AxiosResponse<IApiResponse<IProgrammeProgression>> = await getRequest(
      `/musique/progression/${moduleSlug}`
    );
    if (response.data.success && response.data.data) {
      const progression = programmeProgressionModel(response.data.data);
      saveToStorage(STORAGE_KEY_PROGRESSION(moduleSlug), progression);
      return progression;
    }
    throw new Error(response.data.message || "Erreur lors de la récupération de la progression");
  } catch {
    const cached = loadFromStorage<IProgrammeProgression>(STORAGE_KEY_PROGRESSION(moduleSlug));
    if (cached) return programmeProgressionModel(cached);
    return programmeProgressionModel({ completedSongs: {} });
  }
};

export const updateSongLinksService = async (
  songId: number,
  payload: { tablatureUrl?: string; youtubeUrl?: string }
): Promise<IProgrammeSong> => {
  const response: AxiosResponse<IApiResponse<IProgrammeSong>> = await patchRequest(
    `/musique/songs/${songId}`,
    payload
  );
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.message || "Erreur lors de la mise à jour du morceau");
};

export const updateProgressionService = async (
  moduleSlug: string,
  formData: IProgrammeProgressionFormData
): Promise<IProgrammeProgression> => {
  const optimistic = programmeProgressionModel({ completedSongs: formData.completedSongs });
  saveToStorage(STORAGE_KEY_PROGRESSION(moduleSlug), optimistic);

  try {
    const response: AxiosResponse<IApiResponse<IProgrammeProgression>> = await patchRequest(
      `/musique/progression/${moduleSlug}`,
      formData
    );
    if (response.data.success && response.data.data) {
      return programmeProgressionModel(response.data.data);
    }
  } catch {
    // Backend indisponible — données déjà sauvegardées en localStorage
  }

  return optimistic;
};
