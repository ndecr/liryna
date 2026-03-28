// styles
import "./repertoireTrackItem.scss";

// hooks | libraries
import { ReactElement, useState } from "react";
import { MdEdit, MdDelete, MdOpenInNew, MdCheck } from "react-icons/md";
import { FaYoutube } from "react-icons/fa";

// types
import { IRepertoireTrack } from "../../utils/types/musique.types.ts";

// hooks
import { TRACK_TYPE_LABELS } from "../../hooks/useRepertoire.ts";

// constants
import { findTuningByName, STRING_COLORS } from "../../utils/constants/guitarTunings.ts";

interface IRepertoireTrackItemProps {
  track: IRepertoireTrack;
  onEdit: (track: IRepertoireTrack) => void;
  onDelete: (id: number) => void;
  onToggleMastered: (id: number) => void;
}

export default function RepertoireTrackItem({
  track,
  onEdit,
  onDelete,
  onToggleMastered,
}: IRepertoireTrackItemProps): ReactElement {
  const [tuningOpen, setTuningOpen] = useState<boolean>(false);

  const tuningResult = track.tuning ? findTuningByName(track.tuning) : null;

  return (
    <div className="repertoireTrackItem">
      <button
        type="button"
        className={`trackMasteredBtn ${track.isMastered ? "mastered" : ""}`}
        onClick={() => onToggleMastered(track.id)}
        aria-label={track.isMastered ? "Marquer comme non maîtrisé" : "Marquer comme maîtrisé"}
        title={track.isMastered ? "Maîtrisé" : "Non maîtrisé"}
      >
        <MdCheck />
      </button>

      <div className="trackInfo">
        <span className="trackTitle">{track.title}</span>
        <span className="trackArtist">{track.artist}</span>
        <div className="trackMeta">
          <span className="trackTypeBadge">{TRACK_TYPE_LABELS[track.type]}</span>

          {track.tuning && (
            <button
              type="button"
              className={`trackTuningBtn ${tuningOpen ? "open" : ""}`}
              onClick={() => setTuningOpen((v) => !v)}
              aria-label={`Accordage : ${track.tuning}`}
            >
              {track.tuning}
            </button>
          )}

          {tuningOpen && tuningResult && (
            <div className="trackTuningStrings">
              {tuningResult.tuning.strings.map((note, idx) => {
                const stringNum = 6 - idx;
                return (
                  <div key={idx} className="tuningStringItem">
                    <span
                      className="tuningStringNum"
                      style={{ color: STRING_COLORS[stringNum] }}
                    >
                      {stringNum}
                    </span>
                    <span
                      className="tuningStringNote"
                      style={{
                        background: `${STRING_COLORS[stringNum]}18`,
                        color: STRING_COLORS[stringNum],
                        borderColor: `${STRING_COLORS[stringNum]}50`,
                      }}
                    >
                      {note}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

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
