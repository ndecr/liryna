// styles
import "./repertoireGenreSection.scss";

// hooks | libraries
import { ReactElement } from "react";
import { IoChevronDown } from "react-icons/io5";

// types
import { IRepertoireTrack } from "../../utils/types/musique.types.ts";

// components
import RepertoireTrackItem from "../repertoireTrackItem/RepertoireTrackItem.tsx";

interface IRepertoireGenreSectionProps {
  genre: string;
  tracks: IRepertoireTrack[];
  isOpen: boolean;
  onToggle: () => void;
  onEdit: (track: IRepertoireTrack) => void;
  onDelete: (id: number) => void;
  onToggleMastered: (id: number) => void;
}

export default function RepertoireGenreSection({
  genre,
  tracks,
  isOpen,
  onToggle,
  onEdit,
  onDelete,
  onToggleMastered,
}: IRepertoireGenreSectionProps): ReactElement {
  return (
    <div className="repertoireGenreSection">
      <button
        type="button"
        className="genreSectionHeader"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <IoChevronDown className={`genreChevron ${isOpen ? "open" : ""}`} aria-hidden />
        <span className="genreName">{genre}</span>
        <span className="genreCount">{tracks.length}</span>
      </button>

      {isOpen && (
        <div className="genreSectionBody">
          {tracks.map((track) => (
            <RepertoireTrackItem
              key={track.id}
              track={track}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleMastered={onToggleMastered}
            />
          ))}
        </div>
      )}
    </div>
  );
}
