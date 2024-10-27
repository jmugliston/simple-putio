import PutioAPI from "@putdotio/api-client";

import { BASE_URL, CLIENT_ID } from "../constants";
import { delay } from "../helpers";

class ApiService {
  private api;

  constructor(apiToken: string) {
    this.api = new PutioAPI({ clientID: CLIENT_ID });
    this.api.setToken(apiToken);
  }

  async getDiskInfo() {
    const data = await this.api.Account.Info();

    if (data.status !== 200) {
      throw new Error("Failed to fetch account info");
    }

    const diskUsed = data.body?.info.disk.used || 0;
    const diskAvail = data.body?.info.disk.avail || 0;

    const used = Math.round((diskUsed / (diskUsed + diskAvail)) * 100);
    const free = Math.round(diskAvail / 1024 / 1024 / 1024);

    return {
      used,
      free,
    };
  }

  async getFiles(parentId: number) {
    const data = await this.api.Files.Query(parentId);

    if (data.status !== 200) {
      throw new Error("Failed to fetch files");
    }

    return data.body.files || [];
  }

  async deleteFiles(ids: number[]) {
    const data = await this.api.Files.Delete(ids);

    if (data.status !== 200) {
      throw new Error("Failed to delete file");
    }
  }

  async getTransfers() {
    const data = await this.api.Transfers.Query();

    if (data.status !== 200) {
      throw new Error("Failed to fetch trasfers");
    }

    return data.body?.transfers || [];
  }

  async clearTransfers() {
    const data = await this.api.Transfers.ClearAll();

    if (data.status !== 200) {
      throw new Error("Failed to clear transfers");
    }
  }

  async zipAndDownloadFiles(fileIds: number[]) {
    const data = await this.api.Zips.Create({ ids: fileIds });

    if (data.status !== 200) {
      throw new Error("Failed to zip files");
    }

    let attempts = 0;
    let zipRes;

    while (attempts < 15) {
      zipRes = await this.api.Zips.Get(data.body.zip_id);

      if (zipRes.body.error_msg) {
        throw new Error(zipRes.body.error_msg);
      }

      if (zipRes.body.zip_status === "DONE") {
        chrome.downloads.download({
          url: zipRes.body.url,
        });
        break;
      }

      attempts++;

      if (attempts < 15) {
        await delay(2000);
      } else {
        throw new Error("Zip not ready after 30s");
      }
    }
  }

  async createFolder(name: string, parentId: number) {
    const data = await this.api.Files.CreateFolder({ name, parentId });

    if (data.status !== 200) {
      throw new Error("Failed to create folder");
    }
  }

  async moveFiles(fileIds: number[], parentId: number) {
    const data = await this.api.Files.Move(fileIds, parentId);

    if (data.status !== 200) {
      throw new Error("Failed to move files");
    }
  }

  getDownloadURL(id: number) {
    const url = new URL(`/v2/files/${id}/download`, BASE_URL);
    url.searchParams.append("oauth_token", this.api.token!);
    return url.toString();
  }

  async downloadFile(id: number) {
    chrome.downloads.download({
      url: this.getDownloadURL(id),
    });
  }
}

export default ApiService;
