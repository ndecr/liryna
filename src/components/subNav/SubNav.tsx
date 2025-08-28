// styles
import "./subNav.scss";

// hooks | libraries
import { ReactElement, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoMail } from "react-icons/io5";

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
  subApps?: SubApp[];
}

export default function SubNav(): ReactElement | null {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>("");

  const sections: Section[] = [
    {
      id: "utils",
      name: "Utilitaires",
      path: "/utils",
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

  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath.includes('/utils')) {
      setActiveSection('utils');
    }
  }, [location.pathname]);

  const getCurrentSection = (): Section | undefined => {
    return sections.find(section => section.id === activeSection);
  };

  const getCurrentSubApp = (): SubApp | undefined => {
    const currentSection = getCurrentSection();
    if (!currentSection?.subApps) return undefined;
    
    return currentSection.subApps.find(subApp => 
      location.pathname === subApp.path
    );
  };

  const handleSubAppChange = (subApp: SubApp) => {
    navigate(subApp.path);
  };

  const currentSection = getCurrentSection();
  const currentSubApp = getCurrentSubApp();

  if (!currentSection?.subApps || currentSection.subApps.length === 0) {
    return null;
  }

  return (
    <div id="subNav" className="subNav">
      <div className="subNavContainer">
        {currentSection.subApps.map((subApp) => (
          <button
            key={subApp.id}
            className={`subNavItem ${currentSubApp?.id === subApp.id ? 'active' : ''}`}
            onClick={() => handleSubAppChange(subApp)}
          >
            <span className="subNavIcon">{subApp.icon}</span>
            <span className="subNavText">{subApp.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
