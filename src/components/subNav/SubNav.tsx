// styles
import "./subNav.scss";

// hooks | libraries
import { ReactElement } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IoHome, IoMail, IoWallet, IoMusicalNotes } from "react-icons/io5";
import { MdSettings } from "react-icons/md";

// hooks
import { useUser } from "../../hooks/useUser.ts";

interface ISection {
  id: string;
  name: string;
  path: string;
  icon: ReactElement;
  theme: "utils" | "webdev" | "musique" | "settings";
  visibilityKey?: "mail" | "budget" | "musique";
}

const ALL_SECTIONS: ISection[] = [
  {
    id: "1",
    name: "Accueil",
    path: "/home",
    icon: <IoHome />,
    theme: "utils",
  },
  {
    id: "2",
    name: "Courriers",
    path: "/mail",
    icon: <IoMail />,
    theme: "utils",
    visibilityKey: "mail",
  },
  {
    id: "3",
    name: "Budget",
    path: "/budget",
    icon: <IoWallet />,
    theme: "webdev",
    visibilityKey: "budget",
  },
  {
    id: "4",
    name: "Musique",
    path: "/musique",
    icon: <IoMusicalNotes />,
    theme: "musique",
    visibilityKey: "musique",
  },
  {
    id: "5",
    name: "Paramètres",
    path: "/settings",
    icon: <MdSettings />,
    theme: "settings",
  },
];

export default function SubNav(): ReactElement | null {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  const visibleSections = user?.visibleSections ?? { mail: true, budget: true, musique: true };

  const sections = ALL_SECTIONS.filter((s) => {
    if (!s.visibilityKey) return true;
    return visibleSections[s.visibilityKey] !== false;
  });

  const currentApp = sections.find((s) => location.pathname.startsWith(s.path));

  return (
    <div id="subNav" className="subNav">
      <div className="subNavContainer">
        {sections.map((app: ISection) => (
          <button
            key={app.id}
            className={`subNavItem ${app.theme} ${app.id === currentApp?.id ? "active" : ""}`}
            onClick={() => navigate(app.path)}
          >
            <span className="subNavIcon">{app.icon}</span>
            <span className="subNavText">{app.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
