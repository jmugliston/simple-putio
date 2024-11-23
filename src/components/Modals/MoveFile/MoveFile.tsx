import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IFile } from "@putdotio/api-client";
import { useEffect, useState } from "react";
import Modal from "react-modal";

import { modalStyles } from "../styles";

import ApiService from "../../../services/Api";
import { Spinner } from "../../Loading/Spinner";

export interface MoveFileProps {
  api: ApiService;
  fileIds: number[];
  closeModal: (folderId?: number) => void;
  modalIsOpen: boolean;
}

function MoveFile({ api, fileIds, closeModal, modalIsOpen }: MoveFileProps) {
  const [folders, setFolders] = useState<IFile[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<IFile[]>([]);
  const [navigateInProgress, setNavigateInProgress] = useState(false);

  const currentFolderId =
    breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].id : 0;

  useEffect(() => {
    setNavigateInProgress(true);

    const fetchFolders = async () => {
      try {
        const files: IFile[] = await api.getFiles(currentFolderId);
        const folders = files.filter((file) => file.file_type === "FOLDER");
        setFolders(folders);
      } finally {
        setNavigateInProgress(false);
      }
    };

    fetchFolders();
  }, [api, currentFolderId, modalIsOpen]);

  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={() => closeModal()}
      style={modalStyles}
      contentLabel="Move File"
    >
      <div className="">
        <div className="flex items-center">
          <h2 className="grow m-4 font-semibold text-2xl">
            Move {fileIds.length} File{fileIds.length > 1 ? "s" : ""}
          </h2>
          <button
            aria-label="Close"
            className="mx-4 p-2 text-xs"
            aria-description="close"
            onClick={() => closeModal()}
          >
            <FontAwesomeIcon icon={["fas", "x"]} />
          </button>
        </div>
        <hr />
        <div className="ml-8 max-h-72 h-72 overflow-auto">
          <div className="my-4 text-gray-700">
            Select a folder to move the file{fileIds.length > 1 ? "s" : ""}{" "}
            to...
          </div>
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr className="border flex">
                <th className="text-left my-1 font-semibold">
                  <div className="flex align-center">
                    <div
                      className="cursor-pointer ml-1"
                      onClick={() => setBreadcrumbs([])}
                    >
                      Your Files
                    </div>
                    {breadcrumbs.map((item, idx) => (
                      <div
                        role="button"
                        aria-label={`breadcrumb-file-${item.id}`}
                        key={item.id}
                        onClick={() =>
                          setBreadcrumbs(breadcrumbs.slice(0, idx + 1))
                        }
                      >
                        <span className="mx-2 text-xs">
                          <FontAwesomeIcon icon={["fas", "chevron-right"]} />
                        </span>
                        {item.name}
                      </div>
                    ))}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {navigateInProgress && (
                <tr className="text-center">
                  <td>
                    <div className="mt-8">
                      <Spinner />
                    </div>
                  </td>
                </tr>
              )}
              {!navigateInProgress &&
                folders.map((folder) => (
                  <tr key={folder.id} className="cursor-pointer">
                    <td
                      className={`py-3 hover:bg-gray-100 ${fileIds.includes(folder.id) ? "text-gray-400 disabled cursor-not-allowed pointer-events-none	" : ""}`}
                      onClick={() => setBreadcrumbs([...breadcrumbs, folder])}
                    >
                      <FontAwesomeIcon
                        icon={["far", "folder"]}
                        className="mr-2"
                      />
                      {folder.name}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <hr />
        <div className="text-center">
          <button
            onClick={() => {
              const folder = currentFolderId;
              setBreadcrumbs([]);
              closeModal(folder);
            }}
            className="my-3 bg-amber-300 hover:bg-amber-400 focus:outline-none focus:border-amber-300 focus:ring-1 focus:ring-amber-300 py-2 px-4 rounded"
          >
            Move here
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default MoveFile;
export { MoveFile };
