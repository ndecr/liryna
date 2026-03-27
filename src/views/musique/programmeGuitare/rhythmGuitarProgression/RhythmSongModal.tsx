// styles
import "./rhythmSongModal.scss";

// hooks | libraries
import { ReactElement, useEffect, useState, useContext } from "react";
import { MdClose, MdOpenInNew, MdEdit, MdCheck } from "react-icons/md";
import { FaGuitar, FaYoutube } from "react-icons/fa";

// context
import { RhythmGuitareContext } from "../../../../context/rhythmGuitare/RhythmGuitareContext.tsx";

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
  const { updateSongLinks } = useContext(RhythmGuitareContext);

  const [editMode, setEditMode] = useState(false);
  const [tablatureInput, setTablatureInput] = useState("");
  const [youtubeInput, setYoutubeInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (song) {
      setTablatureInput(song.tablatureUrl ?? "");
      setYoutubeInput(song.youtubeUrl ?? "");
      setEditMode(false);
    }
  }, [song]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editMode) setEditMode(false);
        else onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, editMode]);

  if (!song || !level) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

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

  const handleSaveLinks = async () => {
    setIsSaving(true);
    try {
      await updateSongLinks(song.id, {
        tablatureUrl: tablatureInput,
        youtubeUrl: youtubeInput,
      });
      await showSuccess("Liens mis à jour pour tous les utilisateurs.", "Merci !");
      setEditMode(false);
    } catch {
      await showError("Erreur lors de la mise à jour des liens.");
    } finally {
      setIsSaving(false);
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
          <div className="rhythmSongModalHeaderActions">
            <button
              type="button"
              className={`rhythmSongModalEditBtn ${editMode ? "active" : ""}`}
              onClick={() => setEditMode((v) => !v)}
              aria-label="Modifier les liens"
              title="Modifier les liens"
            >
              <MdEdit />
            </button>
            <button
              type="button"
              className="rhythmSongModalClose"
              onClick={onClose}
              aria-label="Fermer"
            >
              <MdClose />
            </button>
          </div>
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

          {editMode && (
            <div className="rhythmSongModalEditLinks">
              <p className="editLinksTitle">
                Corriger un lien mort — la modification s&apos;applique pour tous les utilisateurs.
              </p>
              <div className="editLinkField">
                <label htmlFor="rhythmTablatureInput" className="editLinkLabel">
                  🎸 Tablature URL
                </label>
                <input
                  id="rhythmTablatureInput"
                  type="url"
                  className="editLinkInput"
                  value={tablatureInput}
                  onChange={(e) => setTablatureInput(e.target.value)}
                  placeholder="https://www.songsterr.com/ ou Ultimate Guitar..."
                />
              </div>
              <div className="editLinkField">
                <label htmlFor="rhythmYoutubeInput" className="editLinkLabel">
                  ▶ YouTube URL
                </label>
                <input
                  id="rhythmYoutubeInput"
                  type="url"
                  className="editLinkInput"
                  value={youtubeInput}
                  onChange={(e) => setYoutubeInput(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              <button
                type="button"
                className="editLinksSaveBtn"
                onClick={handleSaveLinks}
                disabled={isSaving}
              >
                <MdCheck />
                <span>{isSaving ? "Sauvegarde..." : "Sauvegarder les liens"}</span>
              </button>
            </div>
          )}
        </div>

        {!editMode && (
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
        )}
      </div>
    </div>
  );
}
