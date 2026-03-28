// styles
import "./settings.scss";

// hooks | libraries
import { ReactElement, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdPerson, MdVisibility, MdDeleteForever, MdCameraAlt, MdMail, MdMusicNote, MdDelete } from "react-icons/md";
import { IoWallet } from "react-icons/io5";

// components
import WithAuth from "../../utils/middleware/WithAuth.tsx";
import Header from "../../components/header/Header.tsx";
import SubNav from "../../components/subNav/SubNav.tsx";
import Button from "../../components/button/Button.tsx";
import AvatarCropModal from "../../components/avatarCropModal/AvatarCropModal.tsx";

// hooks
import { useUser } from "../../hooks/useUser.ts";

// types
import { IVisibleSections } from "../../utils/types/user.types.ts";

// utils
import { resolveAvatarUrl } from "../../utils/scripts/utils.ts";

function Settings(): ReactElement {
  const navigate = useNavigate();
  const { user, updatePreferences, uploadAvatar, deleteAvatar, deleteAccount } = useUser();

  const [sections, setSections] = useState<IVisibleSections>({
    mail: user?.visibleSections?.mail ?? true,
    budget: user?.visibleSections?.budget ?? true,
    musique: user?.visibleSections?.musique ?? true,
  });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);

  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // ── Préférences sections
  const handleToggleSection = (key: keyof IVisibleSections) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
    setPrefsSaved(false);
  };

  const handleSavePrefs = async () => {
    setSavingPrefs(true);
    try {
      await updatePreferences(sections);
      setPrefsSaved(true);
    } catch {
      // ignore
    } finally {
      setSavingPrefs(false);
    }
  };

  // ── Avatar
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropImageUrl(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleCropConfirm = async (croppedFile: File) => {
    setUploadingAvatar(true);
    setCropImageUrl(null);
    try {
      await uploadAvatar(croppedFile);
    } catch {
      // ignore
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCropCancel = () => {
    if (cropImageUrl) URL.revokeObjectURL(cropImageUrl);
    setCropImageUrl(null);
  };

  const handleDeleteAvatar = async () => {
    setDeletingAvatar(true);
    try {
      await deleteAvatar();
    } catch {
      // ignore
    } finally {
      setDeletingAvatar(false);
    }
  };

  const currentAvatar = resolveAvatarUrl(user?.avatarUrl);
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "?";

  // ── Suppression compte
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "SUPPRIMER") {
      setDeleteError('Saisissez "SUPPRIMER" pour confirmer.');
      return;
    }
    setDeletingAccount(true);
    setDeleteError("");
    try {
      await deleteAccount();
      navigate("/auth");
    } catch {
      setDeleteError("Une erreur est survenue. Réessayez.");
      setDeletingAccount(false);
    }
  };

  const SECTION_ITEMS = [
    { key: "mail" as const, label: "Courriers", icon: <MdMail /> },
    { key: "budget" as const, label: "Budget", icon: <IoWallet /> },
    { key: "musique" as const, label: "Musique", icon: <MdMusicNote /> },
  ];

  return (
    <>
      <Header />
      <SubNav />
      <main id="settings">
        <div className="settingsContainer">

          <header className="settingsHeader" data-aos="fade-down">
            <h1 className="settingsTitle">Paramètres</h1>
            <p className="settingsSubtitle">Gérez votre compte et vos préférences</p>
          </header>

          {/* ── Section : Profil */}
          <section className="settingsCard" data-aos="fade-up" data-aos-delay="100">
            <div className="settingsCardHeader">
              <MdPerson className="settingsCardIcon" />
              <h2 className="settingsCardTitle">Profil</h2>
            </div>

            <div className="profileContent">
              <div className="avatarBlock">
                <div className="avatarWrapper" onClick={() => fileInputRef.current?.click()}>
                  {currentAvatar ? (
                    <img src={currentAvatar} alt="Avatar" className="avatarImg" />
                  ) : (
                    <div className="avatarPlaceholder">{initials}</div>
                  )}
                  <div className="avatarOverlay">
                    <MdCameraAlt />
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="avatarInput"
                  onChange={handleFileSelect}
                />
                {currentAvatar && (
                  <button
                    type="button"
                    className="avatarDeleteBtn"
                    onClick={handleDeleteAvatar}
                    disabled={deletingAvatar}
                    aria-label="Supprimer la photo"
                    title="Supprimer la photo"
                  >
                    <MdDelete />
                  </button>
                )}
                {uploadingAvatar && (
                  <span className="avatarUploading">Envoi...</span>
                )}
              </div>

              <div className="profileInfo">
                <div className="profileRow">
                  <span className="profileLabel">Prénom</span>
                  <span className="profileValue">{user?.firstName}</span>
                </div>
                <div className="profileRow">
                  <span className="profileLabel">Nom</span>
                  <span className="profileValue">{user?.lastName}</span>
                </div>
                <div className="profileRow">
                  <span className="profileLabel">Email</span>
                  <span className="profileValue">{user?.email}</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── Section : Sections visibles */}
          <section className="settingsCard" data-aos="fade-up" data-aos-delay="200">
            <div className="settingsCardHeader">
              <MdVisibility className="settingsCardIcon" />
              <h2 className="settingsCardTitle">Sections visibles</h2>
            </div>
            <p className="settingsCardDesc">
              Choisissez les sections à afficher dans la navigation.
            </p>

            <div className="sectionToggles">
              {SECTION_ITEMS.map(({ key, label, icon }) => (
                <div key={key} className="toggleRow">
                  <div className="toggleLabel">
                    <span className="toggleIcon">{icon}</span>
                    <span>{label}</span>
                  </div>
                  <button
                    type="button"
                    className={`toggleSwitch ${sections[key] ? "on" : "off"}`}
                    onClick={() => handleToggleSection(key)}
                    aria-pressed={sections[key]}
                  >
                    <span className="toggleThumb" />
                  </button>
                </div>
              ))}
            </div>

            <div className="settingsCardActions">
              <Button
                style="orange"
                type="button"
                onClick={handleSavePrefs}
                disabled={savingPrefs}
              >
                {savingPrefs ? "Enregistrement..." : prefsSaved ? "Enregistré ✓" : "Enregistrer"}
              </Button>
            </div>
          </section>

          {/* ── Section : Danger */}
          <section className="settingsCard danger" data-aos="fade-up" data-aos-delay="300">
            <div className="settingsCardHeader">
              <MdDeleteForever className="settingsCardIcon" />
              <h2 className="settingsCardTitle">Supprimer mon compte</h2>
            </div>
            <p className="settingsCardDesc">
              Cette action est <strong>irréversible</strong>. Toutes vos données seront définitivement supprimées :
              courriers, fichiers, budget, musique, simulations.
            </p>

            <div className="deleteConfirmBlock">
              <label className="deleteLabel" htmlFor="deleteConfirm">
                Saisissez <strong>SUPPRIMER</strong> pour confirmer
              </label>
              <input
                id="deleteConfirm"
                type="text"
                className="deleteInput"
                value={deleteConfirm}
                onChange={(e) => { setDeleteConfirm(e.target.value); setDeleteError(""); }}
                placeholder="SUPPRIMER"
                autoComplete="off"
              />
              {deleteError && <p className="deleteError">{deleteError}</p>}
            </div>

            <div className="settingsCardActions">
              <Button
                style="red"
                type="button"
                onClick={handleDeleteAccount}
                disabled={deletingAccount || deleteConfirm !== "SUPPRIMER"}
              >
                {deletingAccount ? "Suppression..." : "Supprimer définitivement mon compte"}
              </Button>
            </div>
          </section>

        </div>
      </main>

      {cropImageUrl && (
        <AvatarCropModal
          imageUrl={cropImageUrl}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
}

const SettingsWithAuth = WithAuth(Settings);
export default SettingsWithAuth;
