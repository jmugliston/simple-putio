// istanbul ignore file
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Modal from "react-modal";
import { ToastContainer } from "react-toastify";
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
  faClipboard,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

import App from "./App.tsx";

import "react-toastify/dist/ReactToastify.css";
import "pretty-checkbox/dist/pretty-checkbox.min.css";
import "react-tooltip/dist/react-tooltip.css";
import "./index.css";

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
  faChevronRight,
  faClipboard
);

Modal.setAppElement("#root");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastContainer />
    <App />
  </StrictMode>
);
