import { createContext, Context } from "react";
import { IRepertoireTrack, IRepertoireTrackFormData } from "../../utils/types/musique.types.ts";

export interface IRepertoireContext {
  tracks: IRepertoireTrack[];
  isLoading: boolean;
  getTracks: () => Promise<void>;
  addTrack: (formData: IRepertoireTrackFormData) => Promise<void>;
  updateTrack: (id: number, formData: Partial<IRepertoireTrackFormData>) => Promise<void>;
  deleteTrack: (id: number) => Promise<void>;
}

export const RepertoireContext: Context<IRepertoireContext> =
  createContext<IRepertoireContext>({
    tracks: [],
    isLoading: false,
    getTracks: async () => {},
    addTrack: async () => {},
    updateTrack: async () => {},
    deleteTrack: async () => {},
  });
