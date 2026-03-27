import { useContext, useMemo, useState } from "react";
import { RepertoireContext } from "../context/repertoire/RepertoireContext.tsx";
import { IRepertoireTrack, IRepertoireTrackType } from "../utils/types/musique.types.ts";

export type IRepertoireFilter = "tous" | IRepertoireTrackType;

export interface IRepertoireFilterOption {
  value: IRepertoireFilter;
  label: string;
}

export const TRACK_TYPE_LABELS: Record<IRepertoireTrackType, string> = {
  partition_complete: "Partition complète",
  rythmique: "Rythmique",
  solo: "Solo",
};

export const FILTER_OPTIONS: IRepertoireFilterOption[] = [
  { value: "tous", label: "Tous" },
  { value: "partition_complete", label: "Partition complète" },
  { value: "rythmique", label: "Rythmique" },
  { value: "solo", label: "Solo" },
];

export interface IGenreGroup {
  genre: string;
  tracks: IRepertoireTrack[];
}

export const useRepertoire = () => {
  const context = useContext(RepertoireContext);
  const [activeFilter, setActiveFilter] = useState<IRepertoireFilter>("tous");

  const filteredTracks = useMemo(() => {
    if (activeFilter === "tous") return context.tracks;
    return context.tracks.filter((t) => t.type === activeFilter);
  }, [context.tracks, activeFilter]);

  const tracksByGenre = useMemo((): IGenreGroup[] => {
    const map = new Map<string, IRepertoireTrack[]>();
    for (const track of filteredTracks) {
      const genre = track.genre.trim() || "Autre";
      if (!map.has(genre)) map.set(genre, []);
      map.get(genre)!.push(track);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b, "fr"))
      .map(([genre, tracks]) => ({ genre, tracks }));
  }, [filteredTracks]);

  const isEmpty = context.tracks.length === 0;
  const isFilteredEmpty = filteredTracks.length === 0 && !isEmpty;

  return {
    ...context,
    activeFilter,
    setActiveFilter,
    tracksByGenre,
    isEmpty,
    isFilteredEmpty,
    FILTER_OPTIONS,
    TRACK_TYPE_LABELS,
  };
};
