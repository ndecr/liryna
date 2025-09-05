// styles
import "./header.scss";

// hooks | libraries
import { ReactElement, useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import {  IoAdd, IoList } from "react-icons/io5";
import { UserContext } from "../../context/user/UserContext.tsx";

// components
import PWAInstallButton from "../pwaInstallButton/PWAInstallButton.tsx";

export default function Header(): ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useContext(UserContext);

  const isAuthRoute: boolean = location.pathname === "/auth";

  const handleLogout = () => {
    logout();
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleNavigate = (path: string) => {
    navigate(path);
    closeMobileMenu();
  };

  return (
    <>
      <header id="header">
        <div className="headerContainer">
          {/* Logo/Brand */}
          <Link
            to={isAuthRoute ? "/auth" : "/home"}
            className="headerBrand"
            onClick={closeMobileMenu}
            title={isAuthRoute ? "" : "Home"}
          >
            <h1 className="brandTitle">
              <span className="what">What</span> a{" "}
              <span className="tool">tool!</span>
            </h1>
          </Link>

          {/* User Info & Desktop Navigation */}
          <div className="headerRight">
            {user && !isAuthRoute && (
              <div className="userInfo">
                <span className="userGreeting">Bonjour {user.firstName}</span>
                <PWAInstallButton variant="desktop" compact={true} />
                <button onClick={handleLogout} className="logoutButton">
                  Déconnexion
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            {!isAuthRoute && (
              <button
                className="headerToggle"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle navigation"
              >
                {isMobileMenuOpen ? <HiX /> : <HiMenu />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && !isAuthRoute && (
        <div className="mobileMenuOverlay" onClick={closeMobileMenu}>
          <div className="mobileMenu utils" onClick={(e) => e.stopPropagation()}>
            <div className="mobileMenuHeader utils">
              <span className="mobileMenuTitle">Navigation</span>
              <button className="mobileMenuClose" onClick={closeMobileMenu}>
                <HiX />
              </button>
            </div>

            <div className="mobileMenuContent">
              {/* User info in mobile menu */}
              {user && (
                <div className="mobileUserInfo">
                  <span className="mobileUserGreeting">
                    Bonjour {user.firstName}
                  </span>
                  <PWAInstallButton variant="mobile" compact={true} />
                  <button onClick={handleLogout} className="mobileLogoutButton">
                    Déconnexion
                  </button>
                </div>
              )}

              {/* Navigation des courriers */}
              <div className="mobileSection">
                <h3 className="mobileSectionTitle">Gestion des courriers</h3>
                <button 
                  className={`mobileNavItem ${location.pathname === '/mail/new' ? 'active' : ''}`}
                  onClick={() => handleNavigate('/mail/new')}
                >
                  <IoAdd className="mobileNavIcon" />
                  <span className="mobileNavText">Ajouter un courrier</span>
                </button>
                <button 
                  className={`mobileNavItem ${location.pathname === '/mail/list' ? 'active' : ''}`}
                  onClick={() => handleNavigate('/mail/list')}
                >
                  <IoList className="mobileNavIcon" />
                  <span className="mobileNavText">Liste des courriers</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
