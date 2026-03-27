import { useState, useMemo, useCallback, ReactElement } from "react";
import { SlapGuitareContext } from "./SlapGuitareContext.tsx";
import {
  IProgrammeLevel,
  IProgrammeProgression,
  CompletedSongs,
} from "../../utils/types/musique.types.ts";
import {
  getModuleSongsService,
  getProgressionService,
  updateProgressionService,
} from "../../API/services/metalGuitare.service.ts";

const MODULE_SLUG = "slap-guitar-progression";

export const SlapGuitareProvider = ({
  children,
}: {
  children: ReactElement;
}): ReactElement => {
  const [levels, setLevels] = useState<IProgrammeLevel[]>([]);
  const [progression, setProgression] = useState<IProgrammeProgression | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getLevels = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const module = await getModuleSongsService(MODULE_SLUG);
      setLevels(module.levels);
    } catch (error) {
      console.error("Error while getting slap module songs:", error);
      setLevels([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getProgression = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const data = await getProgressionService(MODULE_SLUG);
      setProgression(data);
    } catch (error) {
      console.error("Error while getting slap progression:", error);
      setProgression({ completedSongs: {} });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProgression = useCallback(
    async (completedSongs: CompletedSongs): Promise<void> => {
      setIsLoading(true);
      try {
        const updated = await updateProgressionService(MODULE_SLUG, { completedSongs });
        setProgression(updated);
      } catch (error) {
        console.error("Error while updating slap progression:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const toggleSong = useCallback(
    async (songId: number): Promise<void> => {
      const key = songId.toString();
      const current = progression?.completedSongs ?? {};
      const updated: CompletedSongs = { ...current, [key]: !current[key] };
      await updateProgression(updated);
    },
    [progression, updateProgression]
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
    }),
    [levels, progression, isLoading, getLevels, getProgression, updateProgression, toggleSong]
  );

  return (
    <SlapGuitareContext.Provider value={contextValue}>
      {children}
    </SlapGuitareContext.Provider>
  );
};
