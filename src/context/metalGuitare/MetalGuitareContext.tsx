import { createContext, Context } from "react";
import {
  IProgrammeLevel,
  IProgrammeProgression,
  CompletedSongs,
} from "../../utils/types/musique.types.ts";

interface IUpdateSongLinksPayload {
  tablatureUrl?: string;
  youtubeUrl?: string;
}

interface IMetalGuitareContext {
  levels: IProgrammeLevel[];
  progression: IProgrammeProgression | null;
  isLoading: boolean;
  getLevels: () => Promise<void>;
  getProgression: () => Promise<void>;
  toggleSong: (songId: number) => Promise<void>;
  updateProgression: (completedSongs: CompletedSongs) => Promise<void>;
  updateSongLinks: (songId: number, payload: IUpdateSongLinksPayload) => Promise<void>;
}

export const MetalGuitareContext: Context<IMetalGuitareContext> =
  createContext<IMetalGuitareContext>({
    levels: [],
    progression: null,
    isLoading: false,
    getLevels: async (): Promise<void> => {},
    getProgression: async (): Promise<void> => {},
    toggleSong: async (): Promise<void> => {},
    updateProgression: async (): Promise<void> => {},
    updateSongLinks: async (): Promise<void> => {},
  });
