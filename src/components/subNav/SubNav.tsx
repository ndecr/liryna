// styles
import "./subNav.scss";

// hooks | libraries
import { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { IoMail } from "react-icons/io5";

interface ISection {
  id: string;
  name: string;
  path: string;
  icon: ReactElement;
}

export default function SubNav(): ReactElement | null {
  const navigate = useNavigate();

  const sections: ISection[] = [
    {
      id: "1",
      name: "Courriers",
      path: "/mail",
      icon: <IoMail />,
    },
  ];

  const handleAppChange = (app: ISection) => {
    navigate(app.path);
  };

  return (
    <div 
      id="subNav" 
      className={`subNav`}
    >
      <div className="subNavContainer">
        {sections.map((app: ISection) => (
          <button
            key={app.id}
            className={`subNavItem ${app?.id === app.id ? "active" : ""}`}
            onClick={() => handleAppChange(app)}
          >
            <span className="subNavIcon">{app.icon}</span>
            <span className="subNavText">{app.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
