import {
  IProgrammeModule,
  IProgrammeLevel,
  IProgrammeSong,
  IProgrammeProgression,
  CompletedSongs,
} from "../../utils/types/musique.types.ts";

export const programmeSongModel = (data: Partial<IProgrammeSong>): IProgrammeSong => ({
  id: data.id ?? 0,
  levelId: data.levelId ?? 0,
  title: data.title ?? "",
  artist: data.artist ?? "",
  tuning: data.tuning ?? "Standard",
  skill: data.skill ?? "",
  tip: data.tip ?? "",
  bpm: data.bpm ?? 0,
  songsterrUrl: data.songsterrUrl ?? "",
  youtubeUrl: data.youtubeUrl ?? "",
  sortOrder: data.sortOrder ?? 0,
});

export const programmeLevelModel = (data: Partial<IProgrammeLevel>): IProgrammeLevel => ({
  id: data.id ?? 0,
  moduleId: data.moduleId ?? 0,
  slug: data.slug ?? "",
  title: data.title ?? "",
  subtitle: data.subtitle ?? "",
  color: data.color ?? "#666666",
  sortOrder: data.sortOrder ?? 0,
  songs: Array.isArray(data.songs) ? data.songs.map(programmeSongModel) : [],
});

export const programmeModuleModel = (data: Partial<IProgrammeModule>): IProgrammeModule => ({
  id: data.id ?? 0,
  slug: data.slug ?? "",
  name: data.name ?? "",
  instrument: data.instrument ?? "",
  description: data.description ?? "",
  levels: Array.isArray(data.levels) ? data.levels.map(programmeLevelModel) : [],
});

export const programmeProgressionModel = (data: Partial<IProgrammeProgression>): IProgrammeProgression => ({
  id: data.id,
  userId: data.userId,
  moduleId: data.moduleId,
  completedSongs: isValidCompletedSongs(data.completedSongs) ? data.completedSongs : {},
  created_at: data.created_at,
  updated_at: data.updated_at,
});

function isValidCompletedSongs(value: unknown): value is CompletedSongs {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value as Record<string, unknown>).every((v) => typeof v === "boolean")
  );
}
