import { useState, useMemo, useCallback, ReactElement } from "react";
import { RhythmGuitareContext } from "./RhythmGuitareContext.tsx";
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
} from "../../API/services/metalGuitare.service.ts";

const MODULE_SLUG = "rhythm-guitar-progression";

export const RhythmGuitareProvider = ({
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
      console.error("Error while getting rhythm module songs:", error);
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
      console.error("Error while getting rhythm progression:", error);
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
        console.error("Error while updating rhythm progression:", error);
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
      const optimistic: CompletedSongs = { ...current, [key]: !current[key] };
      setProgression((prev) => prev ? { ...prev, completedSongs: optimistic } : prev);
      try {
        await updateProgression(optimistic);
      } catch {
        setProgression((prev) => prev ? { ...prev, completedSongs: current } : prev);
      }
    },
    [progression, updateProgression]
  );

  const updateSongLinks = useCallback(
    async (songId: number, payload: { tablatureUrl?: string; youtubeUrl?: string }): Promise<void> => {
      const updatedSong = await updateSongLinksService(songId, payload);
      setLevels((prev) =>
        prev.map((level) => ({
          ...level,
          songs: level.songs.map((s) =>
            s.id === songId ? { ...s, ...updatedSong } : s
          ),
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
    <RhythmGuitareContext.Provider value={contextValue}>
      {children}
    </RhythmGuitareContext.Provider>
  );
};
