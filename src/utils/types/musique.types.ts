export type IRepertoireTrackType = "rythmique" | "solo" | "partition_complete";

export interface IRepertoireTrack {
  id: number;
  title: string;
  artist: string;
  genre: string;
  type: IRepertoireTrackType;
  tuning: string;
  isMastered: boolean;
  tablatureUrl: string;
  youtubeUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IRepertoireTrackFormData {
  title: string;
  artist: string;
  genre: string;
  type: IRepertoireTrackType;
  tuning: string;
  tablatureUrl: string;
  youtubeUrl: string;
}

export interface IProgrammeSong {
  id: number;
  levelId: number;
  title: string;
  artist: string;
  tuning: string;
  skill: string;
  tip: string;
  bpm: number;
  tablatureUrl: string;
  youtubeUrl: string;
  sortOrder: number;
}

export interface IProgrammeLevel {
  id: number;
  moduleId: number;
  slug: string;
  title: string;
  subtitle: string;
  color: string;
  sortOrder: number;
  songs: IProgrammeSong[];
}

export interface IProgrammeModule {
  id: number;
  slug: string;
  name: string;
  instrument: string;
  description: string;
  levels: IProgrammeLevel[];
}

export type CompletedSongs = Record<string, boolean>;

export interface IProgrammeProgression {
  id?: number;
  userId?: number;
  moduleId?: number;
  completedSongs: CompletedSongs;
  created_at?: string;
  updated_at?: string;
}

export interface IProgrammeProgressionFormData {
  completedSongs: CompletedSongs;
}
