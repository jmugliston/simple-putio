import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IFile } from "@putdotio/api-client";
import { Checkbox } from "pretty-checkbox-react";
import TimeAgo from "react-timeago";
import { Tooltip } from 'react-tooltip'

import ApiService from "../services/Api";
import Spinner from "./Loading";
import AddFolder from "./modals/AddFolder";
import { customTimeFormatter, formatBytes, truncate } from "../helpers";
import MoveFile from "./modals/MoveFile";

function Files({ api }: { api: ApiService }) {
  const [initialLoad, setInitialLoad] = useState(true);
  const [files, setFiles] = useState<IFile[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<IFile[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<number[]>([]);

  const [addFolderModalOpen, setAddFolderModalOpen] = useState(false);
  const [moveFileModalOpen, setMoveFileModalOpen] = useState(false);

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  const currentFolderId =
    breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].id : 0;

  const currentFolderName =
    breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].name : "";

  const selectAllFiles = (checked: boolean) => {
    if (checked) {
      setSelectedFileIds(files.map((file) => file.id));
    } else {
      setSelectedFileIds([]);
    }
  };

  const selectFile = (file: IFile, checked: boolean) => {
    setSelectedFileIds((prev) =>
      checked ? [...prev, file.id] : prev.filter((id) => id !== file.id)
    );
  };

  const clickFile = (file: IFile) => {
    if (file.file_type === "FOLDER") {
      // Clicking a folder navigates to it
      setSelectedFileIds([]);
      setBreadcrumbs([...breadcrumbs, file]);
    } else {
      // Clicking a file selects it
      if (!selectedFileIds.includes(file.id)) {
        setSelectedFileIds([...selectedFileIds, file.id]);
      } else {
        setSelectedFileIds(selectedFileIds.filter((id) => id !== file.id));
      }
    }
  };

  const refreshFileList = async () => {
    const files = await api.getFiles(currentFolderId);
    setFiles(files);
  };

  const runAction = async (action: () => Promise<unknown>) => {
    setActionError(null);
    setActionInProgress(true);
    try {
      await action();
    } catch (error: unknown) {
      setActionError((error as Error).message);
    } finally {
      setSelectedFileIds([]);
      setActionInProgress(false);
      refreshFileList();
    }
  };

  const navigateUp = async () => {
    setSelectedFileIds([]);
    if (breadcrumbs.length > 0) {
      setBreadcrumbs(breadcrumbs.slice(0, breadcrumbs.length - 1));
    }
  };

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const files = await api.getFiles(currentFolderId);
        setFiles(files);
      } finally {
        setInitialLoad(false);
      }
    };

    fetchFiles();

    const interval = setInterval(() => {
      fetchFiles();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [api, currentFolderId]);

  if (initialLoad && files.length === 0) {
    return (
      <div className="text-center mt-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden" style={{ maxHeight: "425px" }}>
      <AddFolder
        closeModal={async (folderName?: string) => {
          setAddFolderModalOpen(false);
          if (folderName && folderName !== "") {
            await runAction(() =>
              api.createFolder(folderName, currentFolderId)
            );
          }
        }}
        modalIsOpen={addFolderModalOpen}
      />
      <MoveFile
        api={api}
        fileIds={selectedFileIds}
        closeModal={async (folderId?: number) => {
          setMoveFileModalOpen(false);
          if (folderId) {
            setSelectedFileIds([]);
            await runAction(() => api.moveFiles(selectedFileIds, folderId));
          }
        }}
        modalIsOpen={moveFileModalOpen}
      />

      {actionError && (
        <div className="flex bg-red-500 py-2 text-white text-center">
          <div className="grow w-100">Error: {actionError}</div>
          <div className="mx-3">
            <button
              aria-description="close"
              onClick={() => setActionError(null)}
            >
              <FontAwesomeIcon icon={["fas", "x"]} />
            </button>
          </div>
        </div>
      )}
      <table className="grow text-gray-800 w-full">
        <thead className="text-xs bg-gray-50 sticky top-0 z-10">
          <tr>
            <th
              scope="col"
              className="px-3 py-3 flex items-center content-center"
            >
              <div className="text-base text-amber-500">
                <Checkbox
                  color="warning"
                  readOnly
                  onClick={(e: React.MouseEvent<HTMLInputElement>) =>
                    selectAllFiles(e.currentTarget.checked)
                  }
                />
              </div>
              <div>
                <h2 className="pl-1 text-left font-regular">
                  {currentFolderId === 0 ? "Your Files" : currentFolderName}
                </h2>
              </div>
              <div className="ml-auto flex items-center">
                {actionInProgress && (
                  <div className="mx-2">
                    <Spinner />
                  </div>
                )}
                <Tooltip
                  id="tooltip-go-up"
                  content="Move up a directory"
                />
                {currentFolderId !== 0 && (
                  <button
                    data-tooltip-id="tooltip-go-up"
                    data-tooltip-content="Move up a directory"
                    onClick={navigateUp}
                    className="mx-1 py-2 border rounded bg-amber-300 text-gray-700 hover:bg-gray-500 hover:text-white w-8"
                  >
                    <FontAwesomeIcon icon={["fas", "turn-up"]} />
                  </button>
                )}
                <Tooltip
                  id="tooltip-delete"
                  content="Delete files"
                />
                <button
                  data-tooltip-id="tooltip-delete"
                  data-tooltip-content="Delete files"
                  disabled={selectedFileIds.length === 0 || actionInProgress}
                  onClick={async () => {
                    await runAction(() => api.deleteFiles(selectedFileIds));
                    const files = await api.getFiles(currentFolderId);
                    setFiles(files);
                  }}
                  className="w-8 mx-1 py-2 border rounded border-gray-400 text-gray-700 bg-white hover:bg-gray-500 hover:text-white disabled:pointer-events-none disabled:border-gray-300 disabled:text-gray-300"
                >
                  <FontAwesomeIcon icon={["far", "trash-can"]} />
                </button>
                <Tooltip
                  id="tooltip-zip"
                  content="Zip and download"
                />
                <button
                  data-tooltip-id="tooltip-zip"
                  data-tooltip-content="Zip and download"
                  disabled={selectedFileIds.length === 0 || actionInProgress}
                  onClick={() =>
                    runAction(() => api.zipAndDownloadFiles(selectedFileIds))
                  }
                  className="w-8 mx-1 py-2 border rounded border-gray-400 text-gray-700 bg-white hover:bg-gray-500 hover:text-white disabled:pointer-events-none disabled:border-gray-300 disabled:text-gray-300"
                >
                  <FontAwesomeIcon icon={["far", "file-zipper"]} />
                </button>
                <Tooltip
                  id="tooltip-copy-url"
                  content="Copy download URL(s)"
                />
                <button
                  data-tooltip-id="tooltip-copy-url"
                  data-tooltip-content="Copy download URL(s)"
                  disabled={selectedFileIds.length === 0 || actionInProgress}
                  onClick={() => {
                    const urls = selectedFileIds.map((id) =>
                      api.getDownloadURL(id)
                    );
                    navigator.clipboard.writeText(urls.join("\n"));
                  }}
                  className="w-8 mx-1 py-2 border rounded border-gray-400 text-gray-700 bg-white hover:bg-gray-500 hover:text-white disabled:pointer-events-none disabled:border-gray-300 disabled:text-gray-300"
                >
                  <FontAwesomeIcon icon={["fas", "link"]} />
                </button>
                <Tooltip
                  id="tooltip-move-folder"
                  content="Move file/folder"
                />
                <button
                  data-tooltip-id="tooltip-move-folder"
                  data-tooltip-content="Move file/folder"
                  disabled={selectedFileIds.length === 0 || actionInProgress}
                  onClick={() => setMoveFileModalOpen(true)}
                  className="w-8 mx-1 py-2 border rounded border-gray-400 text-gray-700 bg-white hover:bg-gray-500 hover:text-white disabled:pointer-events-none disabled:border-gray-300 disabled:text-gray-300"
                >
                  <FontAwesomeIcon icon={["fas", "circle-arrow-right"]} />
                </button>
                <Tooltip
                  id="tooltip-add-folder"
                  content="Add folder"
                />
                <button
                  data-tooltip-id="tooltip-add-folder"
                  data-tooltip-content="Add folder"
                  onClick={() => setAddFolderModalOpen(true)}
                  className="w-8 mx-1 py-2 border rounded border-gray-400 text-gray-700 bg-white hover:bg-gray-500 hover:text-white disabled:pointer-events-none disabled:border-gray-300 disabled:text-gray-300"
                >
                  <FontAwesomeIcon icon={["far", "folder"]} />
                </button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => {
            return (
              <tr
                key={file.id}
                className="bg-white border-b hover:bg-gray-200 cursor-pointer"
              >
                <td className="px-3 py-2 flex items-center content-center">
                  <div className="text-base">
                    <Checkbox
                      color="warning"
                      readOnly
                      checked={selectedFileIds.includes(file.id)}
                      onClick={(e: React.MouseEvent<HTMLInputElement>) =>
                        selectFile(file, e.currentTarget.checked)
                      }
                    />
                  </div>
                  <div
                    className="grow flex content-center items-center"
                    onClick={() => clickFile(file)}
                  >
                    <div className="pr-4">
                      <FontAwesomeIcon
                        icon={[
                          "far",
                          `${file.file_type === "FOLDER" ? "folder" : "file"}`,
                        ]}
                      />
                    </div>
                    <div>
                      <div className="text-base pr-1">
                        {truncate(file.name)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatBytes(file.size)}
                        {" - "}
                        <TimeAgo
                          date={Date.parse(file.created_at + "+00:00")}
                          minPeriod={60}
                          formatter={customTimeFormatter}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="ml-auto text-sm">
                    <button
                      onClick={() => {
                        if (file.file_type === "FOLDER") {
                          runAction(() => api.zipAndDownloadFiles([file.id]));
                        } else {
                          runAction(() => api.downloadFile(file.id));
                        }
                      }}
                      className="p-2 border rounded border-gray-400 text-gray-500 hover:bg-gray-500 hover:text-white"
                    >
                      <FontAwesomeIcon icon={["fas", "cloud-arrow-down"]} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {files.length === 0 && (
        <div className="my-8 text-gray-500 text-center">
          <div>No files whatsoever!</div>
        </div>
      )}
    </div>
  );
}

export default Files;
