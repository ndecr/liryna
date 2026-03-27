// styles
import "./rhythmSongModal.scss";

// hooks | libraries
import { ReactElement, useEffect } from "react";
import { MdClose, MdOpenInNew } from "react-icons/md";
import { FaGuitar, FaYoutube } from "react-icons/fa";

// types
import { IProgrammeSong, IProgrammeLevel } from "../../../../utils/types/musique.types.ts";

// services
import { showSuccess, showError } from "../../../../utils/services/alertService.ts";

interface IRhythmSongModalProps {
  song: IProgrammeSong | null;
  level: IProgrammeLevel | null;
  isDone: boolean;
  onClose: () => void;
  onToggleDone: () => Promise<void>;
}

export default function RhythmSongModal({
  song,
  level,
  isDone,
  onClose,
  onToggleDone,
}: IRhythmSongModalProps): ReactElement | null {
  if (!song || !level) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleOpenTablature = () => {
    window.open(song.tablatureUrl, "_blank", "noopener,noreferrer");
  };

  const handleOpenYoutube = () => {
    window.open(song.youtubeUrl, "_blank", "noopener,noreferrer");
  };

  const handleToggle = async () => {
    try {
      await onToggleDone();
      if (!isDone) {
        await showSuccess(`"${song.title}" marqué comme terminé !`, "Progression mise à jour");
      }
    } catch {
      await showError("Erreur lors de la sauvegarde de la progression.");
    }
  };

  return (
    <div
      id="rhythmSongModal"
      className="rhythmSongModalBackdrop"
      onClick={handleBackdropClick}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`Détails : ${song.title} - ${song.artist}`}
    >
      <div
        className="rhythmSongModalContainer"
        style={{ "--level-color": level.color } as React.CSSProperties}
      >
        <div className="rhythmSongModalHeader">
          <div className="rhythmSongModalHeaderLeft">
            <FaGuitar className="rhythmSongModalHeaderIcon" aria-hidden />
            <div>
              <p className="rhythmSongModalArtist">{song.artist}</p>
              <h2 className="rhythmSongModalTitle">{song.title}</h2>
            </div>
          </div>
          <button
            type="button"
            className="rhythmSongModalClose"
            onClick={onClose}
            aria-label="Fermer"
          >
            <MdClose />
          </button>
        </div>

        <div className="rhythmSongModalBody">
          <div className="rhythmSongModalBadges">
            <span className="rhythmBadgeLevel">{level.title}</span>
            <span className="rhythmBadgeTuning">{song.tuning}</span>
            <span className="rhythmBadgeBpm">{song.bpm} BPM</span>
          </div>

          <div className="rhythmSongModalSkill">
            <span className="rhythmSkillLabel">Compétence ciblée</span>
            <span className="rhythmSkillValue">{song.skill}</span>
          </div>

          <div className="rhythmSongModalTip">
            <span className="rhythmTipIcon" aria-hidden>💡</span>
            <p>{song.tip}</p>
          </div>
        </div>

        <div className="rhythmSongModalFooter">
          <button
            type="button"
            className={`rhythmSongModalDoneBtn ${isDone ? "done" : ""}`}
            onClick={handleToggle}
          >
            {isDone ? "✓ Terminé" : "Marquer comme terminé"}
          </button>

          {song.youtubeUrl && (
            <button
              type="button"
              className="rhythmSongModalYoutubeBtn"
              onClick={handleOpenYoutube}
            >
              <FaYoutube aria-hidden />
              <span>YouTube</span>
              <MdOpenInNew aria-hidden />
            </button>
          )}

          <button
            type="button"
            className="rhythmSongModalTablatureBtn"
            onClick={handleOpenTablature}
          >
            <span>Tablature</span>
            <MdOpenInNew aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
