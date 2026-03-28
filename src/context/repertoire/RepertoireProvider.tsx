import { useState, useMemo, useCallback, ReactElement } from "react";
import { RepertoireContext } from "./RepertoireContext.tsx";
import { IRepertoireTrack, IRepertoireTrackFormData } from "../../utils/types/musique.types.ts";
import {
  getRepertoireService,
  createRepertoireTrackService,
  updateRepertoireTrackService,
  toggleRepertoireTrackMasteredService,
  deleteRepertoireTrackService,
} from "../../API/services/repertoire.service.ts";

export const RepertoireProvider = ({
  children,
}: {
  children: ReactElement;
}): ReactElement => {
  const [tracks, setTracks] = useState<IRepertoireTrack[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getTracks = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const data = await getRepertoireService();
      setTracks(data);
    } catch (error) {
      console.error("Error while getting repertoire:", error);
      setTracks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTrack = useCallback(
    async (formData: IRepertoireTrackFormData): Promise<void> => {
      setIsLoading(true);
      try {
        const created = await createRepertoireTrackService(formData);
        setTracks((prev) => [...prev, created]);
      } catch (error) {
        console.error("Error while creating track:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateTrack = useCallback(
    async (id: number, formData: Partial<IRepertoireTrackFormData>): Promise<void> => {
      setIsLoading(true);
      try {
        const updated = await updateRepertoireTrackService(id, formData);
        setTracks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      } catch (error) {
        console.error("Error while updating track:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const toggleMastered = useCallback(
    async (id: number): Promise<void> => {
      const track = tracks.find((t) => t.id === id);
      if (!track) return;
      try {
        const updated = await toggleRepertoireTrackMasteredService(id, !track.isMastered);
        setTracks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      } catch (error) {
        console.error("Error while toggling mastered:", error);
        throw error;
      }
    },
    [tracks]
  );

  const deleteTrack = useCallback(async (id: number): Promise<void> => {
    setIsLoading(true);
    try {
      await deleteRepertoireTrackService(id);
      setTracks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error while deleting track:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const contextValue = useMemo(
    () => ({ tracks, isLoading, getTracks, addTrack, updateTrack, toggleMastered, deleteTrack }),
    [tracks, isLoading, getTracks, addTrack, updateTrack, toggleMastered, deleteTrack]
  );

  return (
    <RepertoireContext.Provider value={contextValue}>
      {children}
    </RepertoireContext.Provider>
  );
};
