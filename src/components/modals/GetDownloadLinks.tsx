import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Modal from "react-modal";
import { Tooltip } from "react-tooltip";
import copy from "copy-to-clipboard";

Modal.setAppElement("#root");

function GetDownloadLinks({
  closeModal,
  modalIsOpen,
  links,
}: {
  closeModal: (folderName?: string) => void;
  modalIsOpen: boolean;
  links: string[];
}) {
  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={() => closeModal()}
      style={{
        content: {
          top: "10%",
          left: "10%",
          right: "auto",
          bottom: "auto",
          marginRight: "-10%",
          transform: "translate(-6%, -10%)",
          width: "90%",
          padding: 0,
        },
        overlay: {
          zIndex: 999,
        },
      }}
      contentLabel="Download Links"
    >
      <div>
        <div className="flex items-center">
          <h2 className="grow m-4 font-semibold text-2xl">Download Links</h2>
          <button
            className="mx-4 p-2 text-xs"
            aria-description="close"
            onClick={() => closeModal()}
          >
            <FontAwesomeIcon icon={["fas", "x"]} />
          </button>
        </div>
        <hr />
        <div className="m-8">
          <div className="my-2 mx-1 ml-auto text-end">
            <Tooltip id="tooltip-copy" openOnClick={true} content="Copied!" />
            <button
              data-tooltip-id="tooltip-copy"
              data-tooltip-content="Copied!"
              onClick={() => copy(links.join("\n"))}
            >
              <FontAwesomeIcon icon={["fas", "clipboard"]} />
            </button>
          </div>
          <div className="flex">
            <textarea
              readOnly
              rows={7}
              id="links"
              value={links.join("\n")}
              className="rounded-none bg-white border text-gray-900 focus:outline-none focus:border-amber-300 focus:ring-1 focus:ring-amber-300 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default GetDownloadLinks;
