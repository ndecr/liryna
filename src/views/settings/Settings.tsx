import "./settings.scss";

import { ReactElement, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdPerson, MdVisibility, MdDeleteForever, MdCameraAlt, MdMail, MdMusicNote, MdDelete, MdLock, MdEdit } from "react-icons/md";
import { IoWallet } from "react-icons/io5";

import WithAuth from "../../utils/middleware/WithAuth.tsx";
import Header from "../../components/header/Header.tsx";
import SubNav from "../../components/subNav/SubNav.tsx";
import Button from "../../components/button/Button.tsx";
import AvatarCropModal from "../../components/avatarCropModal/AvatarCropModal.tsx";

import { useUser } from "../../hooks/useUser.ts";

import { IVisibleSections } from "../../utils/types/user.types.ts";

import { resolveAvatarUrl } from "../../utils/scripts/utils.ts";
import { validatePasswordStrength, generateStrongPassword } from "../../utils/scripts/passwordValidation.ts";

function Settings(): ReactElement {
  const navigate = useNavigate();
  const { user, updatePreferences, uploadAvatar, deleteAvatar, deleteAccount, changeEmail, changePassword } = useUser();

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

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({ newEmail: "", password: "" });
  const [emailError, setEmailError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const handleOpenEmailModal = () => {
    setEmailForm({ newEmail: user?.email ?? "", password: "" });
    setEmailError("");
    setShowEmailModal(true);
  };

  const handleCloseEmailModal = () => {
    setShowEmailModal(false);
    setEmailForm({ newEmail: "", password: "" });
    setEmailError("");
  };

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    if (!emailForm.newEmail.trim()) {
      setEmailError("L'email est obligatoire");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.newEmail)) {
      setEmailError("Format d'email invalide");
      return;
    }
    if (emailForm.newEmail === user?.email) {
      setEmailError("Le nouvel email doit être différent de l'actuel");
      return;
    }
    if (!emailForm.password) {
      setEmailError("Votre mot de passe est requis pour confirmer");
      return;
    }

    setEmailLoading(true);
    try {
      await changeEmail(emailForm.newEmail, emailForm.password);
      handleCloseEmailModal();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue";
      setEmailError(message);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleOpenPasswordModal = () => {
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordError("");
    setShowPasswordModal(true);
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordError("");
  };

  const passwordStrength = validatePasswordStrength(passwordForm.newPassword);

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!passwordForm.currentPassword) {
      setPasswordError("Le mot de passe actuel est obligatoire");
      return;
    }
    if (!passwordForm.newPassword) {
      setPasswordError("Le nouveau mot de passe est obligatoire");
      return;
    }
    if (!passwordStrength.isValid) {
      setPasswordError("Le nouveau mot de passe ne respecte pas les critères de sécurité");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      handleClosePasswordModal();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue";
      setPasswordError(message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleGeneratePassword = () => {
    const generated = generateStrongPassword(16);
    setPasswordForm((prev) => ({ ...prev, newPassword: generated, confirmPassword: generated }));
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

          <section className="settingsCard" data-aos="fade-up" data-aos-delay="150">
            <div className="settingsCardHeader">
              <MdEdit className="settingsCardIcon" />
              <h2 className="settingsCardTitle">Identifiants</h2>
            </div>
            <p className="settingsCardDesc">
              Modifiez votre adresse email ou votre mot de passe.
            </p>

            <div className="credentialsActions">
              <button type="button" className="credentialBtn" onClick={handleOpenEmailModal}>
                <MdMail className="credentialBtnIcon" />
                <span>Changer l'email</span>
              </button>
              <button type="button" className="credentialBtn" onClick={handleOpenPasswordModal}>
                <MdLock className="credentialBtnIcon" />
                <span>Changer le mot de passe</span>
              </button>
            </div>
          </section>

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

      {showEmailModal && (
        <div className="settingsModalOverlay" onClick={handleCloseEmailModal}>
          <div className="settingsModalContent" onClick={(e) => e.stopPropagation()}>
            <h3 className="settingsModalTitle">Changer l'email</h3>
            <form onSubmit={handleSubmitEmail}>
              <div className="formField">
                <label htmlFor="newEmail">Nouvel email</label>
                <input
                  id="newEmail"
                  type="email"
                  value={emailForm.newEmail}
                  onChange={(e) => setEmailForm((prev) => ({ ...prev, newEmail: e.target.value }))}
                  placeholder="nouveau@email.com"
                  autoComplete="email"
                />
              </div>
              <div className="formField">
                <label htmlFor="emailPassword">Mot de passe actuel</label>
                <input
                  id="emailPassword"
                  type="password"
                  value={emailForm.password}
                  onChange={(e) => setEmailForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Votre mot de passe"
                  autoComplete="current-password"
                />
              </div>
              {emailError && <p className="settingsModalError">{emailError}</p>}
              <div className="settingsModalActions">
                <Button style="grey" type="button" onClick={handleCloseEmailModal}>
                  Annuler
                </Button>
                <Button style="orange" type="submit" disabled={emailLoading}>
                  {emailLoading ? "Enregistrement..." : "Confirmer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="settingsModalOverlay" onClick={handleClosePasswordModal}>
          <div className="settingsModalContent settingsModalContentLarge" onClick={(e) => e.stopPropagation()}>
            <h3 className="settingsModalTitle">Changer le mot de passe</h3>
            <form onSubmit={handleSubmitPassword}>
              <div className="formField">
                <label htmlFor="currentPassword">Mot de passe actuel</label>
                <div className="passwordInputWrapper">
                  <input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Mot de passe actuel"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="passwordToggle"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? "Masquer" : "Afficher"}
                  </button>
                </div>
              </div>

              <div className="formField">
                <label htmlFor="newPassword">Nouveau mot de passe</label>
                <div className="passwordInputWrapper">
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Nouveau mot de passe"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="passwordToggle"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    tabIndex={-1}
                  >
                    {showNewPassword ? "Masquer" : "Afficher"}
                  </button>
                </div>
                {passwordForm.newPassword && (
                  <div className="passwordStrength">
                    <div className="strengthBar">
                      <div
                        className={`strengthFill strength-${passwordStrength.score}`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    <ul className="strengthRequirements">
                      {passwordStrength.requirements
                        .filter((req) => req.priority === "critical")
                        .map((req) => (
                          <li key={req.name} className={req.isMet ? "met" : "unmet"}>
                            {req.isMet ? "✓" : "✗"} {req.description}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="formField">
                <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                <div className="passwordInputWrapper">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirmer le mot de passe"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="passwordToggle"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? "Masquer" : "Afficher"}
                  </button>
                </div>
              </div>

              <button type="button" className="generateBtn" onClick={handleGeneratePassword}>
                Générer un mot de passe fort
              </button>

              {passwordError && <p className="settingsModalError">{passwordError}</p>}
              <div className="settingsModalActions">
                <Button style="grey" type="button" onClick={handleClosePasswordModal}>
                  Annuler
                </Button>
                <Button style="orange" type="submit" disabled={passwordLoading}>
                  {passwordLoading ? "Enregistrement..." : "Confirmer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const SettingsWithAuth = WithAuth(Settings);
export default SettingsWithAuth;
