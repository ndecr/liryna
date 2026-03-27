// styles
import "./songModal.scss";

// hooks | libraries
import { ReactElement, useEffect } from "react";
import { MdClose, MdOpenInNew } from "react-icons/md";
import { FaGuitar, FaYoutube } from "react-icons/fa";

// types
import { IProgrammeSong, IProgrammeLevel } from "../../../../utils/types/musique.types.ts";

// services
import { showSuccess, showError } from "../../../../utils/services/alertService.ts";

interface ISongModalProps {
  song: IProgrammeSong | null;
  level: IProgrammeLevel | null;
  isDone: boolean;
  onClose: () => void;
  onToggleDone: () => Promise<void>;
}

export default function SongModal({
  song,
  level,
  isDone,
  onClose,
  onToggleDone,
}: ISongModalProps): ReactElement | null {
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

  const handleOpenSongsterr = () => {
    window.open(song.songsterrUrl, "_blank", "noopener,noreferrer");
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
      id="songModal"
      className="songModalBackdrop"
      onClick={handleBackdropClick}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`Détails : ${song.title} - ${song.artist}`}
    >
      <div
        className="songModalContainer"
        style={{ "--level-color": level.color } as React.CSSProperties}
      >
        <div className="songModalHeader">
          <div className="songModalHeaderLeft">
            <FaGuitar className="songModalHeaderIcon" aria-hidden />
            <div>
              <p className="songModalArtist">{song.artist}</p>
              <h2 className="songModalTitle">{song.title}</h2>
            </div>
          </div>
          <button
            type="button"
            className="songModalClose"
            onClick={onClose}
            aria-label="Fermer"
          >
            <MdClose />
          </button>
        </div>

        <div className="songModalBody">
          <div className="songModalBadges">
            <span className="badgeLevel">{level.title}</span>
            <span className="badgeTuning">{song.tuning}</span>
            <span className="badgeBpm">{song.bpm} BPM</span>
          </div>

          <div className="songModalSkill">
            <span className="skillLabel">Compétence ciblée</span>
            <span className="skillValue">{song.skill}</span>
          </div>

          <div className="songModalTip">
            <span className="tipIcon" aria-hidden>💡</span>
            <p>{song.tip}</p>
          </div>
        </div>

        <div className="songModalFooter">
          <button
            type="button"
            className={`songModalDoneBtn ${isDone ? "done" : ""}`}
            onClick={handleToggle}
          >
            {isDone ? "✓ Terminé" : "Marquer comme terminé"}
          </button>

          {song.youtubeUrl && (
            <button
              type="button"
              className="songModalYoutubeBtn"
              onClick={handleOpenYoutube}
            >
              <FaYoutube aria-hidden />
              <span>YouTube</span>
              <MdOpenInNew aria-hidden />
            </button>
          )}

          <button
            type="button"
            className="songModalSongsterrBtn"
            onClick={handleOpenSongsterr}
          >
            <span>Songsterr</span>
            <MdOpenInNew aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
