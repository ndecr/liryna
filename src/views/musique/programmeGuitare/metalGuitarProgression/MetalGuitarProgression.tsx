// styles
import "./metalGuitarProgression.scss";

// hooks | libraries
import { ReactElement, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdOutlineArrowBack } from "react-icons/md";
import { FaGuitar } from "react-icons/fa";
import { IoChevronDown, IoChevronForward } from "react-icons/io5";

// context
import { MetalGuitareContext } from "../../../../context/metalGuitare/MetalGuitareContext.tsx";

// types
import { IProgrammeLevel, IProgrammeSong } from "../../../../utils/types/musique.types.ts";

// components
import WithAuth from "../../../../utils/middleware/WithAuth.tsx";
import Header from "../../../../components/header/Header.tsx";
import SubNav from "../../../../components/subNav/SubNav.tsx";
import SongModal from "./SongModal.tsx";

interface IModalSong {
  song: IProgrammeSong;
  level: IProgrammeLevel;
}

function MetalGuitarProgression(): ReactElement {
  const navigate = useNavigate();
  const { levels, progression, isLoading, getLevels, getProgression, toggleSong } =
    useContext(MetalGuitareContext);

  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);
  const [expandedSong, setExpandedSong] = useState<number | null>(null);
  const [modalSong, setModalSong] = useState<IModalSong | null>(null);

  useEffect(() => {
    getLevels();
    getProgression();
  }, [getLevels, getProgression]);

  useEffect(() => {
    if (levels.length > 0 && expandedLevel === null) {
      setExpandedLevel(levels[0].id);
    }
  }, [levels, expandedLevel]);

  const completedSongs = progression?.completedSongs ?? {};

  const totalSongs = levels.reduce((acc, l) => acc + l.songs.length, 0);
  const completedCount = Object.values(completedSongs).filter(Boolean).length;
  const progressPercent = totalSongs > 0 ? Math.round((completedCount / totalSongs) * 100) : 0;

  const getLevelProgress = (level: IProgrammeLevel) => {
    const done = level.songs.filter((s) => completedSongs[s.id.toString()]).length;
    return { done, total: level.songs.length };
  };

  const handleToggleLevel = (levelId: number) => {
    setExpandedLevel((prev) => (prev === levelId ? null : levelId));
  };

  const handleToggleSong = (songId: number) => {
    setExpandedSong((prev) => (prev === songId ? null : songId));
  };

  const handleCheckSong = async (
    e: React.MouseEvent<HTMLButtonElement>,
    songId: number
  ) => {
    e.stopPropagation();
    await toggleSong(songId);
  };

  const handleOpenModal = (
    e: React.MouseEvent<HTMLButtonElement>,
    song: IProgrammeSong,
    level: IProgrammeLevel
  ) => {
    e.stopPropagation();
    setModalSong({ song, level });
  };

  const handleModalToggleDone = async () => {
    if (modalSong) await toggleSong(modalSong.song.id);
  };

  return (
    <>
      <Header />
      <SubNav />
      <main id="metalGuitarProgression">
        <div className="metalContainer">
          <button
            type="button"
            className="backButton"
            onClick={() => navigate("/musique/programme-guitare")}
          >
            <MdOutlineArrowBack />
            <span>Retour</span>
          </button>

          <header className="metalHeader">
            <p className="metalLabel">Metal Guitar Progression</p>
            <h1 className="metalTitle">Du power chord au tremolo pick</h1>
            <p className="metalSubtitle">
              25 morceaux dans l&apos;ordre · Coche au fur et à mesure · Songsterr pour les tabs
            </p>
          </header>

          <div
            className="globalProgress"
            aria-label={`Progression globale : ${completedCount} sur ${totalSongs} morceaux`}
          >
            <div className="globalProgressHeader">
              <span className="globalProgressLabel">Progression globale</span>
              <span className="globalProgressCount">
                {isLoading ? "..." : `${completedCount} / ${totalSongs}`}
              </span>
            </div>
            <div className="progressTrack">
              <div
                className="progressFill"
                style={{ width: `${progressPercent}%` }}
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>

          <div className="levels">
            {isLoading && levels.length === 0 ? (
              <div className="metalLoading">Chargement…</div>
            ) : (
              levels.map((level, levelIdx) => {
                const { done, total } = getLevelProgress(level);
                const isOpen = expandedLevel === level.id;
                const levelComplete = done === total && total > 0;

                return (
                  <div
                    key={level.id}
                    className={`levelCard ${isOpen ? "open" : ""}`}
                    style={{ "--level-color": level.color } as React.CSSProperties}
                  >
                    <button
                      type="button"
                      className="levelCardHeader"
                      onClick={() => handleToggleLevel(level.id)}
                      aria-expanded={isOpen}
                    >
                      <div className={`levelBadge ${levelComplete ? "complete" : ""}`}>
                        {levelComplete ? "✓" : `${done}/${total}`}
                      </div>
                      <div className="levelInfo">
                        <span className="levelTitle">{level.title}</span>
                        <span className="levelSubtitle">{level.subtitle}</span>
                      </div>
                      <IoChevronDown className="levelChevron" aria-hidden />
                    </button>

                    {isOpen && (
                      <div className="levelSongs">
                        {level.songs.map((song: IProgrammeSong, idx: number) => {
                          const isDone = !!completedSongs[song.id.toString()];
                          const isExpanded = expandedSong === song.id;
                          const globalIdx =
                            levels
                              .slice(0, levelIdx)
                              .reduce((acc, l) => acc + l.songs.length, 0) +
                            idx +
                            1;

                          return (
                            <div
                              key={song.id}
                              className={`songItem ${isDone ? "done" : ""} ${isExpanded ? "expanded" : ""}`}
                            >
                              <div
                                className="songRow"
                                onClick={() => handleToggleSong(song.id)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) =>
                                  e.key === "Enter" && handleToggleSong(song.id)
                                }
                                aria-expanded={isExpanded}
                              >
                                <button
                                  type="button"
                                  className="songCheckbox"
                                  onClick={(e) => handleCheckSong(e, song.id)}
                                  aria-label={`Marquer "${song.title}" comme ${isDone ? "non terminé" : "terminé"}`}
                                >
                                  {isDone ? "✓" : ""}
                                </button>

                                <span className="songNumber">
                                  {String(globalIdx).padStart(2, "0")}
                                </span>

                                <div className="songContent">
                                  <span className="songTitle">{song.title}</span>
                                  <span className="songArtist">{song.artist}</span>
                                </div>

                                <span className="songTuning">{song.tuning}</span>

                                <button
                                  type="button"
                                  className="songTabBtn"
                                  onClick={(e) => handleOpenModal(e, song, level)}
                                  aria-label={`Voir la tablature de ${song.title}`}
                                  title="Voir la tablature"
                                >
                                  <FaGuitar aria-hidden />
                                </button>

                                <IoChevronForward className="songExpandArrow" aria-hidden />
                              </div>

                              {isExpanded && (
                                <div className="songDetails">
                                  <div className="songTags">
                                    <span className="tagSkill">{song.skill}</span>
                                    <span className="tagBpm">{song.bpm} BPM</span>
                                  </div>
                                  <p className="songTip">💡 {song.tip}</p>
                                  <div className="songLinks">
                                    <a
                                      href={song.songsterrUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="songsterrLink"
                                    >
                                      🎸 Songsterr
                                    </a>
                                    {song.youtubeUrl && (
                                      <a
                                        href={song.youtubeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="youtubeLink"
                                      >
                                        ▶ YouTube
                                      </a>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="metalMethode">
            <strong>Méthode :</strong> Ralentis chaque morceau à 60% sur Songsterr ou YouTube
            (vitesse 0.5x/0.75x). Apprends riff par riff, pas le morceau entier d&apos;un coup.
            Monte la vitesse par paliers de 5% seulement quand c&apos;est propre.
          </div>
        </div>
      </main>

      <SongModal
        song={modalSong?.song ?? null}
        level={modalSong?.level ?? null}
        isDone={modalSong ? !!completedSongs[modalSong.song.id.toString()] : false}
        onClose={() => setModalSong(null)}
        onToggleDone={handleModalToggleDone}
      />
    </>
  );
}

const MetalGuitarProgressionWithAuth = WithAuth(MetalGuitarProgression);
export default MetalGuitarProgressionWithAuth;
