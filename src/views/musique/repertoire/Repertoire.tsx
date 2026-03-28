// styles
import "./repertoire.scss";

// hooks | libraries
import { ReactElement, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdAdd, MdLibraryMusic, MdArrowBack } from "react-icons/md";

// utils
import WithAuth from "../../../utils/middleware/WithAuth.tsx";

// context
import { RepertoireProvider } from "../../../context/repertoire/RepertoireProvider.tsx";

// hooks
import { useRepertoire } from "../../../hooks/useRepertoire.ts";

// types
import { IRepertoireTrack, IRepertoireTrackFormData } from "../../../utils/types/musique.types.ts";

// components
import Header from "../../../components/header/Header.tsx";
import SubNav from "../../../components/subNav/SubNav.tsx";
import Loader from "../../../components/loader/Loader.tsx";
import Button from "../../../components/button/Button.tsx";
import RepertoireGenreSection from "../../../components/repertoireGenreSection/RepertoireGenreSection.tsx";
import RepertoireTrackModal from "../../../components/repertoireTrackModal/RepertoireTrackModal.tsx";

function Repertoire(): ReactElement {
  const navigate = useNavigate();
  const {
    isLoading,
    getTracks,
    addTrack,
    updateTrack,
    toggleMastered,
    deleteTrack,
    tracksByGenre,
    activeFilter,
    setActiveFilter,
    isEmpty,
    isFilteredEmpty,
    progressStats,
    FILTER_OPTIONS,
  } = useRepertoire();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTrack, setEditingTrack] = useState<IRepertoireTrack | null>(null);
  const [openGenre, setOpenGenre] = useState<string | null>(null);

  useEffect(() => {
    getTracks();
  }, [getTracks]);

  const handleOpenAdd = () => {
    setEditingTrack(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (track: IRepertoireTrack) => {
    setEditingTrack(track);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTrack(null);
  };

  const handleSubmit = async (formData: IRepertoireTrackFormData): Promise<void> => {
    if (editingTrack) {
      await updateTrack(editingTrack.id, formData);
    } else {
      await addTrack(formData);
    }
    handleCloseModal();
  };

  const handleDelete = async (id: number): Promise<void> => {
    await deleteTrack(id);
  };

  return (
    <>
      <Header />
      <SubNav />
      <main id="repertoire">
        <div className="repertoireContainer">
          <Button style="musiqueBack" onClick={() => navigate("/musique")}>
            <MdArrowBack />
            <span>Retour</span>
          </Button>

          <header className="repertoireHeader">
            <p className="repertoireLabel">Mon Répertoire</p>
            <h1 className="repertoireTitle">Mes morceaux</h1>
            <p className="repertoireSubtitle">Suivi personnel de tes pistes et partitions</p>
          </header>

          {!isEmpty && (
            <div className="repertoireProgress">
              <div className="progressInfo">
                <span className="progressLabel">Maîtrisés</span>
                <span className="progressCount">
                  {progressStats.mastered} / {progressStats.total}
                </span>
              </div>
              <div className="progressBarTrack">
                <div
                  className="progressBarFill"
                  style={{ width: `${progressStats.percent}%` }}
                />
              </div>
              <span className="progressPercent">{progressStats.percent}%</span>
            </div>
          )}

          <div className="repertoireToolbar">
            <div className="repertoireFilters">
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`filterBtn ${activeFilter === option.value ? "active" : ""}`}
                  onClick={() => setActiveFilter(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <button type="button" className="repertoireAddBtn" onClick={handleOpenAdd}>
              <MdAdd />
              <span>Ajouter</span>
            </button>
          </div>

          {isLoading && <Loader size="medium" />}

          {!isLoading && isEmpty && (
            <div className="repertoireEmpty">
              <MdLibraryMusic className="emptyIcon" />
              <p className="emptyTitle">Aucun morceau pour l'instant</p>
              <p className="emptyText">
                Commence à constituer ton répertoire en ajoutant tes premières pistes.
              </p>
            </div>
          )}

          {!isLoading && isFilteredEmpty && (
            <div className="repertoireEmpty">
              <MdLibraryMusic className="emptyIcon" />
              <p className="emptyTitle">Aucun résultat pour ce filtre</p>
              <p className="emptyText">
                Essaie un autre type ou ajoute de nouveaux morceaux dans cette catégorie.
              </p>
            </div>
          )}

          {!isLoading && !isEmpty && !isFilteredEmpty && (
            <div className="repertoireSections">
              {tracksByGenre.map((group) => (
                <RepertoireGenreSection
                  key={group.genre}
                  genre={group.genre}
                  tracks={group.tracks}
                  isOpen={openGenre === group.genre}
                  onToggle={() => setOpenGenre(openGenre === group.genre ? null : group.genre)}
                  onEdit={handleOpenEdit}
                  onDelete={handleDelete}
                  onToggleMastered={toggleMastered}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <RepertoireTrackModal
          track={editingTrack}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}

function RepertoireWithProvider(): ReactElement {
  return (
    <RepertoireProvider>
      <Repertoire />
    </RepertoireProvider>
  );
}

const RepertoireWithAuth = WithAuth(RepertoireWithProvider);
export default RepertoireWithAuth;
