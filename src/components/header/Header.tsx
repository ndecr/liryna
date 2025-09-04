// styles
import "./header.scss";

// hooks | libraries
import { ReactElement, useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiMenu, HiX, HiHome } from "react-icons/hi";
import { MdDeveloperMode, MdBuild } from "react-icons/md";
import { IoMail } from "react-icons/io5";
import { UserContext } from "../../context/user/UserContext.tsx";

// components
import PWAInstallButton from "../pwaInstallButton/PWAInstallButton.tsx";
import PWADebug from "../pwaDebug/PWADebug.tsx";

interface SubApp {
  id: string;
  name: string;
  path: string;
  icon: ReactElement;
}

interface Section {
  id: string;
  name: string;
  path: string;
  icon: ReactElement;
  color: "webdev" | "utils";
  subApps?: SubApp[];
}

export default function Header(): ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const { user, logout } = useContext(UserContext);

  const isAuthRoute: boolean = location.pathname === "/auth";

  const handleLogout = () => {
    logout();
  };

  const sections: Section[] = [
    {
      id: "home",
      name: "Accueil",
      path: "/home",
      icon: <HiHome />,
      color: "utils",
    },
    {
      id: "webdev",
      name: "Web Dev",
      path: "/web_dev",
      icon: <MdDeveloperMode />,
      color: "webdev",
      subApps: [],
    },
    {
      id: "utils",
      name: "Utilitaires",
      path: "/utils",
      icon: <MdBuild />,
      color: "utils",
      subApps: [
        {
          id: "courriers",
          name: "Courriers",
          path: "/utils/mail",
          icon: <IoMail />,
        },
      ],
    },
  ];

  // Determine current section and sub-app
  useEffect(() => {
    const currentPath = location.pathname;

    if (currentPath === "/" || currentPath === "/home") {
      setActiveSection("home");
    } else if (currentPath.includes("/web_dev")) {
      setActiveSection("webdev");
    } else if (currentPath.includes("/utils")) {
      setActiveSection("utils");
    }
  }, [location.pathname]);

  const getCurrentSection = (): Section | undefined => {
    return sections.find((section) => section.id === activeSection);
  };

  const handleSectionChange = (section: Section) => {
    setActiveSection(section.id);
    navigate(section.path);
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const currentSection = getCurrentSection();

  return (
    <>
      <header
        id="header"
        className={`header ${currentSection?.color || "utils"}`}
      >
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

          {/* Desktop Navigation */}
          <div className="headerDesktop">
            {!isAuthRoute &&
              sections.map((section) => (
                <button
                  key={section.id}
                  className={`navItem ${
                    activeSection === section.id ? "active" : ""
                  }`}
                  onClick={() => handleSectionChange(section)}
                >
                  <span className="navIcon">{section.icon}</span>
                  <span className="navText">{section.name}</span>
                </button>
              ))}
          </div>

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
          <div
            className={`mobileMenu ${currentSection?.color || "utils"}`}
            onClick={(e) => e.stopPropagation()}
          >
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
                  <PWADebug />
                  <button onClick={handleLogout} className="mobileLogoutButton">
                    Déconnexion
                  </button>
                </div>
              )}

              {sections.map((section) => (
                <div key={section.id} className="mobileSection">
                  <button
                    className={`mobileNavItem ${
                      activeSection === section.id ? "active" : ""
                    }`}
                    onClick={() => handleSectionChange(section)}
                  >
                    <span className="mobileNavIcon">{section.icon}</span>
                    <span className="mobileNavText">{section.name}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
