// styles
import "./repertoireGenreSection.scss";

// hooks | libraries
import { ReactElement, useState } from "react";
import { IoChevronDown } from "react-icons/io5";

// types
import { IRepertoireTrack } from "../../utils/types/musique.types.ts";

// components
import RepertoireTrackItem from "../repertoireTrackItem/RepertoireTrackItem.tsx";

interface IRepertoireGenreSectionProps {
  genre: string;
  tracks: IRepertoireTrack[];
  onEdit: (track: IRepertoireTrack) => void;
  onDelete: (id: number) => void;
}

export default function RepertoireGenreSection({
  genre,
  tracks,
  onEdit,
  onDelete,
}: IRepertoireGenreSectionProps): ReactElement {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="repertoireGenreSection">
      <button
        type="button"
        className="genreSectionHeader"
        onClick={() => setIsOpen((v) => !v)}
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
