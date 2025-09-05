// styles
import "./header.scss";

// hooks | libraries
import { ReactElement, useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import { UserContext } from "../../context/user/UserContext.tsx";

// components
import PWAInstallButton from "../pwaInstallButton/PWAInstallButton.tsx";

export default function Header(): ReactElement {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useContext(UserContext);

  const isAuthRoute: boolean = location.pathname === "/auth";

  const handleLogout = () => {
    logout();
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

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
          <div onClick={(e) => e.stopPropagation()}>
            <div className="mobileMenuHeader">
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
            </div>
          </div>
        </div>
      )}
    </>
  );
}
