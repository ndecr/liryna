import { IRepertoireTrack, IRepertoireTrackType } from "../../utils/types/musique.types.ts";

const VALID_TYPES: IRepertoireTrackType[] = ["rythmique", "solo", "partition_complete"];

export const repertoireTrackModel = (data: Partial<IRepertoireTrack>): IRepertoireTrack => ({
  id: data.id ?? 0,
  title: data.title ?? "",
  artist: data.artist ?? "",
  genre: data.genre ?? "",
  type: VALID_TYPES.includes(data.type as IRepertoireTrackType)
    ? (data.type as IRepertoireTrackType)
    : "partition_complete",
  tuning: data.tuning ?? "",
  isMastered: data.isMastered ?? false,
  tablatureUrl: data.tablatureUrl ?? "",
  youtubeUrl: data.youtubeUrl ?? "",
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
});
