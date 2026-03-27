// styles
import "./repertoireTrackItem.scss";

// hooks | libraries
import { ReactElement } from "react";
import { MdEdit, MdDelete, MdOpenInNew } from "react-icons/md";
import { FaYoutube } from "react-icons/fa";

// types
import { IRepertoireTrack } from "../../utils/types/musique.types.ts";

// hooks
import { TRACK_TYPE_LABELS } from "../../hooks/useRepertoire.ts";

interface IRepertoireTrackItemProps {
  track: IRepertoireTrack;
  onEdit: (track: IRepertoireTrack) => void;
  onDelete: (id: number) => void;
}

export default function RepertoireTrackItem({
  track,
  onEdit,
  onDelete,
}: IRepertoireTrackItemProps): ReactElement {
  return (
    <div className="repertoireTrackItem">
      <div className="trackInfo">
        <span className="trackTitle">{track.title}</span>
        <span className="trackArtist">{track.artist}</span>
        <div className="trackMeta">
          <span className="trackTypeBadge">{TRACK_TYPE_LABELS[track.type]}</span>
          <div className="trackLinks">
            {track.tablatureUrl && (
              <a
                href={track.tablatureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="trackLink tablature"
              >
                🎸 <span>Tab</span> <MdOpenInNew aria-hidden />
              </a>
            )}
            {track.youtubeUrl && (
              <a
                href={track.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="trackLink youtube"
              >
                <FaYoutube aria-hidden /> <span>YT</span> <MdOpenInNew aria-hidden />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="trackActions">
        <button
          type="button"
          className="trackActionBtn"
          onClick={() => onEdit(track)}
          aria-label={`Modifier ${track.title}`}
          title="Modifier"
        >
          <MdEdit />
        </button>
        <button
          type="button"
          className="trackActionBtn delete"
          onClick={() => onDelete(track.id)}
          aria-label={`Supprimer ${track.title}`}
          title="Supprimer"
        >
          <MdDelete />
        </button>
      </div>
    </div>
  );
}
