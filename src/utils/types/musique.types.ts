export interface IProgrammeSong {
  id: number;
  levelId: number;
  title: string;
  artist: string;
  tuning: string;
  skill: string;
  tip: string;
  bpm: number;
  songsterrUrl: string;
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

// completedSongs : clé = song.id.toString(), valeur = boolean
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
