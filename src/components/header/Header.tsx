// styles
import "./header.scss";

// hooks | libraries
import { ReactElement, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import { IoHome, IoAdd, IoList, IoWallet, IoCreate } from "react-icons/io5";
import { MdDashboard, MdLogout, MdMusicNote, MdLibraryMusic, MdTune, MdSettings, MdDescription } from "react-icons/md";
import { FiHome } from "react-icons/fi";
import { GiGuitar } from "react-icons/gi";
import { useUser } from "../../hooks/useUser.ts";
import { resolveAvatarUrl } from "../../utils/scripts/utils.ts";

// components
import PWAInstallButton from "../pwaInstallButton/PWAInstallButton.tsx";
import Button from "../button/Button.tsx";

export default function Header(): ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useUser();

  const isAuthRoute: boolean = location.pathname === "/auth";
  const visibleSections = user?.visibleSections ?? { mail: true, budget: true, musique: true };
  const avatarUrl = resolveAvatarUrl(user?.avatarUrl);
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "?";

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return "Bonjour";
    if (hour >= 12 && hour < 18) return "Bon après-midi";
    if (hour >= 18 && hour < 22) return "Bonsoir";
    return "Bonne nuit";
  };

  const handleLogout = () => { logout(); };

  useEffect(() => {
    return () => { document.body.style.overflow = ""; };
  }, []);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = "";
  };

  const openMobileMenu = () => {
    setIsMobileMenuOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    closeMobileMenu();
  };

  const menuTheme = location.pathname.startsWith("/musique")
    ? "musique"
    : location.pathname.startsWith("/budget")
      ? "webdev"
      : "utils";

  return (
    <>
      <header id="header">
        <div className="headerContainer">
          <Link
            to={isAuthRoute && !user ? "/auth" : "/home"}
            className="headerBrand"
            onClick={closeMobileMenu}
            title={isAuthRoute && !user ? "" : "Home"}
          >
            <h1 className="brandTitle">
              <span className="Lir">Lir</span>
              <span className="yna">yna</span>
            </h1>
          </Link>

          <div className="headerRight">
            {!user && !location.pathname.startsWith("/auth/login") && (
              <Link to="/auth/login">
                <Button style="seaGreen">Se connecter</Button>
              </Link>
            )}

            {user && !isAuthRoute && (
              <div className="userInfo">
                <span className="userGreeting">{getGreeting()}, <strong>{user.firstName}</strong></span>
                <PWAInstallButton variant="desktop" compact={true} />
                <div className="headerAvatar" onClick={() => navigate("/settings")} title="Paramètres">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="headerAvatarImg" />
                  ) : (
                    <span className="headerAvatarInitial">{initials}</span>
                  )}
                </div>
                <button
                  onClick={() => navigate("/settings")}
                  className="settingsButton"
                  aria-label="Paramètres"
                  title="Paramètres"
                >
                  <MdSettings />
                </button>
                <button onClick={handleLogout} className="logoutButton" aria-label="Déconnexion" title="Déconnexion">
                  <MdLogout />
                </button>
              </div>
            )}

            {!isAuthRoute && (
              <button
                className="headerToggle"
                onClick={() => isMobileMenuOpen ? closeMobileMenu() : openMobileMenu()}
                aria-label="Toggle navigation"
              >
                {isMobileMenuOpen ? <HiX /> : <HiMenu />}
              </button>
            )}
          </div>
        </div>
      </header>

      {isMobileMenuOpen && !isAuthRoute && (
        <div className="mobileMenuOverlay" onClick={closeMobileMenu}>
          <div
            className={`mobileMenu ${menuTheme}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`mobileMenuHeader ${menuTheme}`}>
              <span className="mobileMenuTitle">Navigation</span>
              <button className="mobileMenuClose" onClick={closeMobileMenu}>
                <HiX />
              </button>
            </div>

            <div className="mobileMenuContent">
              {user && (
                <div className="mobileUserInfo">
                  <span className="mobileUserGreeting">
                    {getGreeting()}, <strong>{user.firstName}</strong>
                  </span>
                  <PWAInstallButton variant="mobile" compact={true} />
                  <button onClick={() => handleNavigate("/settings")} className="mobileSettingsButton" aria-label="Paramètres">
                    <MdSettings />
                    <span>Paramètres</span>
                  </button>
                  <button onClick={handleLogout} className="mobileLogoutButton" aria-label="Déconnexion">
                    <MdLogout />
                    <span>Déconnexion</span>
                  </button>
                </div>
              )}

              {/* Accueil */}
              <div className="mobileSection">
                <button
                  className={`mobileNavItem ${location.pathname === "/home" ? "active" : ""}`}
                  onClick={() => handleNavigate("/home")}
                >
                  <IoHome className="mobileNavIcon" />
                  <span className="mobileNavText">Accueil</span>
                </button>
              </div>

              {/* Courriers */}
              {visibleSections.mail && (
                <div className="mobileSection">
                  <h3 className="mobileSectionTitle">Gestion des courriers</h3>
                  <button
                    className={`mobileNavItem ${location.pathname === "/mail/new" ? "active" : ""}`}
                    onClick={() => handleNavigate("/mail/new")}
                  >
                    <IoAdd className="mobileNavIcon" />
                    <span className="mobileNavText">Ajouter un courrier</span>
                  </button>
                  <button
                    className={`mobileNavItem ${location.pathname === "/mail/list" ? "active" : ""}`}
                    onClick={() => handleNavigate("/mail/list")}
                  >
                    <IoList className="mobileNavIcon" />
                    <span className="mobileNavText">Liste des courriers</span>
                  </button>
                </div>
              )}

              {/* Budget */}
              {visibleSections.budget && (
                <div className="mobileSection">
                  <h3 className="mobileSectionTitle">Gestion du budget</h3>
                  <button
                    className={`mobileNavItem ${location.pathname === "/budget" ? "active" : ""}`}
                    onClick={() => handleNavigate("/budget")}
                  >
                    <IoWallet className="mobileNavIcon" />
                    <span className="mobileNavText">Budget</span>
                  </button>
                  <button
                    className={`mobileNavItem ${location.pathname.startsWith("/budget/dashboard") ? "active" : ""}`}
                    onClick={() => handleNavigate("/budget/dashboard")}
                  >
                    <MdDashboard className="mobileNavIcon" />
                    <span className="mobileNavText">Tableau de bord</span>
                  </button>
                  <button
                    className={`mobileNavItem ${location.pathname.startsWith("/budget/edit") ? "active" : ""}`}
                    onClick={() => handleNavigate("/budget/edit")}
                  >
                    <IoCreate className="mobileNavIcon" />
                    <span className="mobileNavText">Editer le budget</span>
                  </button>
                  <button
                    className={`mobileNavItem ${location.pathname.startsWith("/budget/pret-immobilier") ? "active" : ""}`}
                    onClick={() => handleNavigate("/budget/pret-immobilier")}
                  >
                    <FiHome className="mobileNavIcon" />
                    <span className="mobileNavText">Simulateur immobilier</span>
                  </button>
                </div>
              )}

              {/* Musique */}
              {visibleSections.musique && (
                <div className="mobileSection">
                  <h3 className="mobileSectionTitle musique">Musique</h3>
                  <button
                    className={`mobileNavItem ${location.pathname === "/musique" ? "active" : ""}`}
                    onClick={() => handleNavigate("/musique")}
                  >
                    <MdMusicNote className="mobileNavIcon" />
                    <span className="mobileNavText">Hub Musique</span>
                  </button>
                  <button
                    className={`mobileNavItem ${location.pathname.startsWith("/musique/programme-guitare") ? "active" : ""}`}
                    onClick={() => handleNavigate("/musique/programme-guitare")}
                  >
                    <GiGuitar className="mobileNavIcon" />
                    <span className="mobileNavText">Programme Guitare</span>
                  </button>
                  <button
                    className={`mobileNavItem ${location.pathname === "/musique/repertoire" ? "active" : ""}`}
                    onClick={() => handleNavigate("/musique/repertoire")}
                  >
                    <MdLibraryMusic className="mobileNavIcon" />
                    <span className="mobileNavText">Mon Répertoire</span>
                  </button>
                  <button
                    className={`mobileNavItem ${location.pathname === "/musique/documents" ? "active" : ""}`}
                    onClick={() => handleNavigate("/musique/documents")}
                  >
                    <MdDescription className="mobileNavIcon" />
                    <span className="mobileNavText">Mes Documents</span>
                  </button>
                  <button
                    className={`mobileNavItem ${location.pathname === "/musique/accordages-guitare" ? "active" : ""}`}
                    onClick={() => handleNavigate("/musique/accordages-guitare")}
                  >
                    <MdTune className="mobileNavIcon" />
                    <span className="mobileNavText">Accordages Guitare</span>
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
