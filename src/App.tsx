import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Files, Transfers } from "./components/Pages";
import { Footer } from "./components/Footer/Footer";
import { useApiToken } from "./hooks/ApiToken";
import { ApiService } from "./services/Api";
import { Spinner } from "./components/Loading/Spinner";

import logo from "../assets/images/putio-logo.svg";

function App() {
  const [activeTab, setActiveTab] = useState("Files");
  const [clearInProgress, setClearInProgress] = useState(false);

  const { apiToken, getAuth } = useApiToken();

  const api = new ApiService(apiToken);

  const wrapperStyles = {
    minWidth: "570px",
    maxWidth: "570px",
    minHeight: "525px",
    maxHeight: "525px",
  };

  if (!apiToken) {
    return (
      <div style={wrapperStyles}>
        <div className="text-center my-8">
          <button
            onClick={() => getAuth()}
            className={`my-3 font-semibold ${activeTab === "Files" ? "bg-amber-300" : "hover:bg-gray-50"} py-2 px-4 rounded`}
          >
            Log in to Put.io
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={wrapperStyles}>
      <div className="flex max-h-16">
        <div className="content-center">
          <a target="_blank" href="https://app.put.io/">
            <img
              src={logo}
              alt="Put.io logo"
              className="my-auto mx-3"
              style={{ height: "30px" }}
            />
          </a>
        </div>
        <button
          onClick={() => setActiveTab("Files")}
          className={`my-3 font-semibold ${activeTab === "Files" ? "bg-amber-300" : "hover:bg-gray-50"} py-2 px-4 rounded w-24`}
        >
          Files
        </button>
        <button
          onClick={() => setActiveTab("Transfers")}
          className={`my-3 font-semibold ${activeTab === "Transfers" ? "bg-amber-300" : "hover:bg-gray-50"} py-2 px-4 rounded w-24`}
        >
          Transfers
        </button>
        {activeTab === "Transfers" && (
          <div className="grow text-right content-center">
            <button
              onClick={() => {
                setClearInProgress(true);
                api.clearTransfers().finally(() => {
                  setClearInProgress(false);
                });
              }}
              className={`my-3 hover:bg-gray-50 py-2 px-4 rounded min-w-28`}
            >
              {clearInProgress ? <Spinner /> : "Clear Finished"}
            </button>
          </div>
        )}
        {activeTab === "Files" && (
          <div className="grow text-right content-center mx-4 text-lg">
            <a target="_blank" href="https://github.com/atheius/simple-putio">
              <FontAwesomeIcon icon={["fab", "github"]} />
            </a>
          </div>
        )}
      </div>
      <div className="grow">
        {activeTab === "Transfers" ? (
          <Transfers api={api} />
        ) : (
          <Files api={api} />
        )}
      </div>
      <div className="justify-self-end">
        <Footer api={api} />
      </div>
    </div>
  );
}

export default App;
