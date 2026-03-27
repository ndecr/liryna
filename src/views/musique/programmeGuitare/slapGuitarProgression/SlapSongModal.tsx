// styles
import "./slapSongModal.scss";

// hooks | libraries
import { ReactElement, useEffect, useState, useContext } from "react";
import { MdClose, MdOpenInNew, MdEdit, MdCheck } from "react-icons/md";
import { FaGuitar, FaYoutube } from "react-icons/fa";

// context
import { SlapGuitareContext } from "../../../../context/slapGuitare/SlapGuitareContext.tsx";

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
  const { updateSongLinks } = useContext(SlapGuitareContext);

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
          <div className="slapSongModalHeaderActions">
            <button
              type="button"
              className={`slapSongModalEditBtn ${editMode ? "active" : ""}`}
              onClick={() => setEditMode((v) => !v)}
              aria-label="Modifier les liens"
              title="Modifier les liens"
            >
              <MdEdit />
            </button>
            <button
              type="button"
              className="slapSongModalClose"
              onClick={onClose}
              aria-label="Fermer"
            >
              <MdClose />
            </button>
          </div>
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

          {editMode && (
            <div className="slapSongModalEditLinks">
              <p className="editLinksTitle">
                Corriger un lien mort — la modification s&apos;applique pour tous les utilisateurs.
              </p>
              <div className="editLinkField">
                <label htmlFor="slapTablatureInput" className="editLinkLabel">
                  🎸 Tablature URL
                </label>
                <input
                  id="slapTablatureInput"
                  type="url"
                  className="editLinkInput"
                  value={tablatureInput}
                  onChange={(e) => setTablatureInput(e.target.value)}
                  placeholder="https://www.songsterr.com/ ou Ultimate Guitar..."
                />
              </div>
              <div className="editLinkField">
                <label htmlFor="slapYoutubeInput" className="editLinkLabel">
                  ▶ YouTube URL
                </label>
                <input
                  id="slapYoutubeInput"
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

            {song.tablatureUrl && (
              <button
                type="button"
                className="slapSongModalTablatureBtn"
                onClick={handleOpenTablature}
              >
                <span>Tablature</span>
                <MdOpenInNew aria-hidden />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
