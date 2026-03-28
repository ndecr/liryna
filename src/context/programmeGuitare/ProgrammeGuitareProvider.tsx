import { useState, useMemo, useCallback, ReactElement } from "react";
import { ProgrammeGuitareContext, IUpdateSongLinksPayload } from "./ProgrammeGuitareContext.tsx";
import {
  IProgrammeLevel,
  IProgrammeProgression,
  CompletedSongs,
} from "../../utils/types/musique.types.ts";
import {
  getModuleSongsService,
  getProgressionService,
  updateProgressionService,
  updateSongLinksService,
} from "../../API/services/programmeGuitare.service.ts";

interface IProgrammeGuitareProviderProps {
  moduleSlug: string;
  children: ReactElement;
}

export const ProgrammeGuitareProvider = ({
  moduleSlug,
  children,
}: IProgrammeGuitareProviderProps): ReactElement => {
  const [levels, setLevels] = useState<IProgrammeLevel[]>([]);
  const [progression, setProgression] = useState<IProgrammeProgression | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getLevels = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const module = await getModuleSongsService(moduleSlug);
      setLevels(module.levels);
    } catch (error) {
      console.error("Error while getting module songs:", error);
      setLevels([]);
    } finally {
      setIsLoading(false);
    }
  }, [moduleSlug]);

  const getProgression = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const data = await getProgressionService(moduleSlug);
      setProgression(data);
    } catch (error) {
      console.error("Error while getting progression:", error);
      setProgression({ completedSongs: {} });
    } finally {
      setIsLoading(false);
    }
  }, [moduleSlug]);

  const updateProgression = useCallback(
    async (completedSongs: CompletedSongs): Promise<void> => {
      setIsLoading(true);
      try {
        const updated = await updateProgressionService(moduleSlug, { completedSongs });
        setProgression(updated);
      } catch (error) {
        console.error("Error while updating progression:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [moduleSlug]
  );

  const toggleSong = useCallback(
    async (songId: number): Promise<void> => {
      const key = songId.toString();
      let current: CompletedSongs = {};
      let optimistic: CompletedSongs = {};

      setProgression((prev) => {
        current = prev?.completedSongs ?? {};
        optimistic = { ...current, [key]: !current[key] };
        return prev ? { ...prev, completedSongs: optimistic } : prev;
      });

      try {
        await updateProgression(optimistic);
      } catch {
        setProgression((prev) => (prev ? { ...prev, completedSongs: current } : prev));
      }
    },
    [updateProgression]
  );

  const updateSongLinks = useCallback(
    async (songId: number, payload: IUpdateSongLinksPayload): Promise<void> => {
      const updatedSong = await updateSongLinksService(songId, payload);
      setLevels((prev) =>
        prev.map((level) => ({
          ...level,
          songs: level.songs.map((s) => (s.id === songId ? { ...s, ...updatedSong } : s)),
        }))
      );
    },
    []
  );

  const contextValue = useMemo(
    () => ({
      levels,
      progression,
      isLoading,
      getLevels,
      getProgression,
      updateProgression,
      toggleSong,
      updateSongLinks,
    }),
    [levels, progression, isLoading, getLevels, getProgression, updateProgression, toggleSong, updateSongLinks]
  );

  return (
    <ProgrammeGuitareContext.Provider value={contextValue}>
      {children}
    </ProgrammeGuitareContext.Provider>
  );
};
