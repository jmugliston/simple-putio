import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faFile,
  faFolder,
  faFileZipper,
  faTrashCan,
} from "@fortawesome/free-regular-svg-icons";
import {
  faLink,
  faDownload,
  faCloudArrowDown,
  faCircleArrowRight,
  faTurnUp,
  faCircleExclamation,
  faX,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

import App from "./App.tsx";

import "./index.css";
import "../node_modules/pretty-checkbox/dist/pretty-checkbox.min.css";

library.add(
  faTrashCan,
  faLink,
  faFile,
  faFolder,
  faFileZipper,
  faDownload,
  faCloudArrowDown,
  faGithub,
  faCircleArrowRight,
  faTurnUp,
  faCircleExclamation,
  faX,
  faChevronRight
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
