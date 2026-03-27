// styles
import "./songModal.scss";

// hooks | libraries
import { ReactElement, useEffect, useState, useContext } from "react";
import { MdClose, MdOpenInNew, MdEdit, MdCheck } from "react-icons/md";
import { FaGuitar, FaYoutube } from "react-icons/fa";

// context
import { MetalGuitareContext } from "../../../../context/metalGuitare/MetalGuitareContext.tsx";

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
  const { updateSongLinks } = useContext(MetalGuitareContext);

  const [editMode, setEditMode] = useState(false);
  const [songsterrInput, setSongsterrInput] = useState("");
  const [youtubeInput, setYoutubeInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (song) {
      setSongsterrInput(song.songsterrUrl ?? "");
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

  const handleSaveLinks = async () => {
    setIsSaving(true);
    try {
      await updateSongLinks(song.id, {
        songsterrUrl: songsterrInput,
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
          <div className="songModalHeaderActions">
            <button
              type="button"
              className={`songModalEditBtn ${editMode ? "active" : ""}`}
              onClick={() => setEditMode((v) => !v)}
              aria-label="Modifier les liens"
              title="Modifier les liens"
            >
              <MdEdit />
            </button>
            <button
              type="button"
              className="songModalClose"
              onClick={onClose}
              aria-label="Fermer"
            >
              <MdClose />
            </button>
          </div>
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

          {editMode && (
            <div className="songModalEditLinks">
              <p className="editLinksTitle">
                Corriger un lien mort — la modification s&apos;applique pour tous les utilisateurs.
              </p>
              <div className="editLinkField">
                <label htmlFor="songsterrInput" className="editLinkLabel">
                  🎸 Songsterr URL
                </label>
                <input
                  id="songsterrInput"
                  type="url"
                  className="editLinkInput"
                  value={songsterrInput}
                  onChange={(e) => setSongsterrInput(e.target.value)}
                  placeholder="https://www.songsterr.com/..."
                />
              </div>
              <div className="editLinkField">
                <label htmlFor="youtubeInput" className="editLinkLabel">
                  ▶ YouTube URL
                </label>
                <input
                  id="youtubeInput"
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
        )}
      </div>
    </div>
  );
}
