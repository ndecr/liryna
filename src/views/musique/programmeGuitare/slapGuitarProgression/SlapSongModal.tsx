// styles
import "./slapSongModal.scss";

// hooks | libraries
import { ReactElement, useEffect } from "react";
import { MdClose, MdOpenInNew } from "react-icons/md";
import { FaGuitar, FaYoutube } from "react-icons/fa";

// types
import { IProgrammeSong, IProgrammeLevel } from "../../../../utils/types/musique.types.ts";

// services
import { showSuccess, showError } from "../../../../utils/services/alertService.ts";

interface ISlapSongModalProps {
  song: IProgrammeSong | null;
  level: IProgrammeLevel | null;
  isDone: boolean;
  onClose: () => void;
  onToggleDone: () => Promise<void>;
}

export default function SlapSongModal({
  song,
  level,
  isDone,
  onClose,
  onToggleDone,
}: ISlapSongModalProps): ReactElement | null {
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
      id="slapSongModal"
      className="slapSongModalBackdrop"
      onClick={handleBackdropClick}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`Détails : ${song.title} - ${song.artist}`}
    >
      <div
        className="slapSongModalContainer"
        style={{ "--level-color": level.color } as React.CSSProperties}
      >
        <div className="slapSongModalHeader">
          <div className="slapSongModalHeaderLeft">
            <FaGuitar className="slapSongModalHeaderIcon" aria-hidden />
            <div>
              <p className="slapSongModalArtist">{song.artist}</p>
              <h2 className="slapSongModalTitle">{song.title}</h2>
            </div>
          </div>
          <button
            type="button"
            className="slapSongModalClose"
            onClick={onClose}
            aria-label="Fermer"
          >
            <MdClose />
          </button>
        </div>

        <div className="slapSongModalBody">
          <div className="slapSongModalBadges">
            <span className="slapBadgeLevel">{level.title}</span>
            <span className="slapBadgeTuning">{song.tuning}</span>
            <span className="slapBadgeBpm">{song.bpm} BPM</span>
          </div>

          <div className="slapSongModalSkill">
            <span className="slapSkillLabel">Compétence ciblée</span>
            <span className="slapSkillValue">{song.skill}</span>
          </div>

          <div className="slapSongModalTip">
            <span className="slapTipIcon" aria-hidden>💡</span>
            <p>{song.tip}</p>
          </div>
        </div>

        <div className="slapSongModalFooter">
          <button
            type="button"
            className={`slapSongModalDoneBtn ${isDone ? "done" : ""}`}
            onClick={handleToggle}
          >
            {isDone ? "✓ Terminé" : "Marquer comme terminé"}
          </button>

          {song.youtubeUrl && (
            <button
              type="button"
              className="slapSongModalYoutubeBtn"
              onClick={handleOpenYoutube}
            >
              <FaYoutube aria-hidden />
              <span>YouTube</span>
              <MdOpenInNew aria-hidden />
            </button>
          )}

          {song.songsterrUrl && (
            <button
              type="button"
              className="slapSongModalSongsterrBtn"
              onClick={handleOpenSongsterr}
            >
              <span>Songsterr</span>
              <MdOpenInNew aria-hidden />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
