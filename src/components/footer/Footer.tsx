// styles
import "./footer.scss";

// hooks | libraries
import { ReactElement } from "react";

export default function Footer(): ReactElement {
  return (
    <footer id="footer">
      <div className={"textWrapper"}>
        <p>Liryna ©DECRESSAC Nicolas – 2025</p>
      </div>
    </footer>
  );
}
