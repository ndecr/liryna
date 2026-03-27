// styles
import "./repertoireTrackModal.scss";

// hooks | libraries
import { ReactElement, useEffect, useState } from "react";
import { MdClose, MdCheck } from "react-icons/md";

// types
import { IRepertoireTrack, IRepertoireTrackFormData, IRepertoireTrackType } from "../../utils/types/musique.types.ts";

const GENRES_SUGGESTIONS = [
  "Blues", "Classical", "Country", "Electro", "Flamenco", "Folk",
  "Funk", "Jazz", "Metal", "Pop", "Punk", "R&B", "Raggae",
  "Rock", "Soul", "World",
];

interface IFormErrors {
  title?: string;
  artist?: string;
  genre?: string;
}

interface IRepertoireTrackModalProps {
  track?: IRepertoireTrack | null;
  isLoading: boolean;
  onSubmit: (formData: IRepertoireTrackFormData) => Promise<void>;
  onClose: () => void;
}

const DEFAULT_FORM: IRepertoireTrackFormData = {
  title: "",
  artist: "",
  genre: "",
  type: "partition_complete",
  tablatureUrl: "",
  youtubeUrl: "",
};

export default function RepertoireTrackModal({
  track,
  isLoading,
  onSubmit,
  onClose,
}: IRepertoireTrackModalProps): ReactElement {
  const isEditMode = track != null;

  const [form, setForm] = useState<IRepertoireTrackFormData>(DEFAULT_FORM);
  const [errors, setErrors] = useState<IFormErrors>({});

  useEffect(() => {
    if (track) {
      setForm({
        title: track.title,
        artist: track.artist,
        genre: track.genre,
        type: track.type,
        tablatureUrl: track.tablatureUrl,
        youtubeUrl: track.youtubeUrl,
      });
    } else {
      setForm(DEFAULT_FORM);
    }
    setErrors({});
  }, [track]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleChange = (field: keyof IRepertoireTrackFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field as keyof IFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: IFormErrors = {};
    if (!form.title.trim()) newErrors.title = "Le titre est requis";
    if (!form.artist.trim()) newErrors.artist = "L'artiste est requis";
    if (!form.genre.trim()) newErrors.genre = "Le genre est requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      id="repertoireTrackModal"
      className="repertoireTrackModalBackdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={isEditMode ? "Modifier le morceau" : "Ajouter un morceau"}
    >
      <div className="repertoireTrackModalContainer">
        <div className="repertoireTrackModalHeader">
          <h2 className="repertoireModalTitle">
            {isEditMode ? "Modifier le morceau" : "Ajouter un morceau"}
          </h2>
          <button
            type="button"
            className="repertoireModalClose"
            onClick={onClose}
            aria-label="Fermer"
          >
            <MdClose />
          </button>
        </div>

        <form className="repertoireTrackModalForm" onSubmit={handleSubmit} noValidate>
          <div className="formRow">
            <div className="formField">
              <label className="formLabel">
                Titre <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`formInput ${errors.title ? "error" : ""}`}
                value={form.title}
                onChange={handleChange("title")}
                placeholder="Ex : Faint"
                autoFocus
              />
              {errors.title && <span className="formError">{errors.title}</span>}
            </div>

            <div className="formField">
              <label className="formLabel">
                Artiste <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`formInput ${errors.artist ? "error" : ""}`}
                value={form.artist}
                onChange={handleChange("artist")}
                placeholder="Ex : Linkin Park"
              />
              {errors.artist && <span className="formError">{errors.artist}</span>}
            </div>
          </div>

          <div className="formRow">
            <div className="formField">
              <label className="formLabel">
                Genre <span className="required">*</span>
              </label>
              <input
                type="text"
                list="genresSuggestions"
                className={`formInput ${errors.genre ? "error" : ""}`}
                value={form.genre}
                onChange={handleChange("genre")}
                placeholder="Ex : Metal"
              />
              <datalist id="genresSuggestions">
                {GENRES_SUGGESTIONS.map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>
              {errors.genre && <span className="formError">{errors.genre}</span>}
            </div>

            <div className="formField">
              <label className="formLabel">Type</label>
              <select
                className="formSelect"
                value={form.type}
                onChange={handleChange("type")}
              >
                <option value="partition_complete">Partition complète</option>
                <option value="rythmique">Rythmique</option>
                <option value="solo">Solo</option>
              </select>
            </div>
          </div>

          <div className="formField">
            <label className="formLabel">URL Tablature</label>
            <input
              type="url"
              className="formInput"
              value={form.tablatureUrl}
              onChange={handleChange("tablatureUrl")}
              placeholder="https://www.songsterr.com/ ou Ultimate Guitar..."
            />
          </div>

          <div className="formField">
            <label className="formLabel">URL YouTube</label>
            <input
              type="url"
              className="formInput"
              value={form.youtubeUrl}
              onChange={handleChange("youtubeUrl")}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <button type="submit" className="formSubmitBtn" disabled={isLoading}>
            <MdCheck />
            <span>{isLoading ? "Sauvegarde..." : isEditMode ? "Enregistrer" : "Ajouter"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
