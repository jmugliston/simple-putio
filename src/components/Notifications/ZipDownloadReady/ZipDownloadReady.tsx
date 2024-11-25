import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import copy from "copy-to-clipboard";
import { Tooltip } from "react-tooltip";

import { formatBytes } from "../../../helpers";

export interface ZipDownloadReadyProps {
  link: string;
  size: number;
}

function ZipDownloadReady({ link, size }: ZipDownloadReadyProps) {
  return (
    <div>
      <div className="flex align-center mb-2 text-base">
        <div className="mr-3">
          <Tooltip id="tooltip-copy" openOnClick={true} content="Copied!" />
          <button
            aria-label="Copy"
            data-tooltip-id="tooltip-copy"
            data-tooltip-content="Copied!"
            onClick={() => copy(link)}
          >
            <FontAwesomeIcon icon={["fas", "clipboard"]} />
          </button>
        </div>
        <div>
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="text-blue-500 underline"
          >
            Download zip file
          </a>
          <p className="font-bold text-sm">{formatBytes(size)}</p>
        </div>
      </div>
      <p className="text-xs">
        Please use a download manager, browsers are terrible at resuming broken
        downloads. Also applications monitoring your network traffic like some
        antivirus or firewall software may corrupt the zip file.
      </p>
    </div>
  );
}

export default ZipDownloadReady;
export { ZipDownloadReady };
