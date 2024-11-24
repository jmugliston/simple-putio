import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import ApiService from "./Api";

const apiToken = "test-token";

vi.mock("@putdotio/api-client", () => ({
  default: vi.fn().mockImplementation(() => ({
    token: apiToken,
    setToken: vi.fn(),
    Account: {
      Info: vi.fn(),
    },
    Files: {
      Query: vi.fn(),
      Delete: vi.fn(),
      CreateFolder: vi.fn(),
      Move: vi.fn(),
    },
    Transfers: {
      Query: vi.fn(),
      ClearAll: vi.fn(),
    },
  })),
}));

describe("ApiService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with the correct token", () => {
    const apiService = new ApiService(apiToken);
    expect(apiService.api.setToken).toHaveBeenCalledWith(apiToken);
  });

  it("should fetch disk info", async () => {
    const apiService = new ApiService(apiToken);

    const mockResponse = {
      status: 200,
      body: {
        info: {
          disk: {
            used: 5368709120,
            avail: 5368709120,
          },
        },
      },
    };

    (apiService.api.Account.Info as Mock).mockResolvedValue(mockResponse);

    const result = await apiService.getDiskInfo();

    expect(result).toEqual({ used: 50, free: 5 });
  });

  it("should fetch files", async () => {
    const apiService = new ApiService(apiToken);

    const mockResponse = {
      status: 200,
      body: {
        files: [{ id: 1, name: "file1" }],
      },
    };

    (apiService.api.Files.Query as Mock).mockResolvedValue(mockResponse);

    const result = await apiService.getFiles(0);

    expect(result).toEqual([{ id: 1, name: "file1" }]);
  });

  it("should delete files", async () => {
    const apiService = new ApiService(apiToken);

    const mockResponse = { status: 200 };

    (apiService.api.Files.Delete as Mock).mockResolvedValue(mockResponse);

    await apiService.deleteFiles([1, 2]);

    expect(apiService.api.Files.Delete).toHaveBeenCalledWith([1, 2]);
  });

  it("should fetch transfers", async () => {
    const apiService = new ApiService(apiToken);

    const mockResponse = {
      status: 200,
      body: {
        transfers: [{ id: 1, name: "transfer1" }],
      },
    };

    (apiService.api.Transfers.Query as Mock).mockResolvedValue(mockResponse);

    const result = await apiService.getTransfers();

    expect(result).toEqual([{ id: 1, name: "transfer1" }]);
  });

  it("should clear transfers", async () => {
    const apiService = new ApiService(apiToken);

    const mockResponse = { status: 200 };

    (apiService.api.Transfers.ClearAll as Mock).mockResolvedValue(mockResponse);

    await apiService.clearTransfers();

    expect(apiService.api.Transfers.ClearAll).toHaveBeenCalled();
  });

  it("should create folder", async () => {
    const apiService = new ApiService(apiToken);

    const mockResponse = { status: 200 };

    (apiService.api.Files.CreateFolder as Mock).mockResolvedValue(mockResponse);

    await apiService.createFolder("new-folder", 0);

    expect(apiService.api.Files.CreateFolder).toHaveBeenCalledWith({
      name: "new-folder",
      parentId: 0,
    });
  });

  it("should move files", async () => {
    const apiService = new ApiService(apiToken);

    const mockResponse = { status: 200 };

    (apiService.api.Files.Move as Mock).mockResolvedValue(mockResponse);

    await apiService.moveFiles([1, 2], 0);

    expect(apiService.api.Files.Move).toHaveBeenCalledWith([1, 2], 0);
  });

  it("should get download URL", () => {
    const apiService = new ApiService(apiToken);

    const url = apiService.getDownloadURL(1);

    expect(url).toContain("/v2/files/1/download");
    expect(url).toContain("oauth_token=test-token");
  });

  it("should get all files in folder", async () => {
    const apiService = new ApiService(apiToken);

    const mockResponse = {
      status: 200,
      body: {
        files: [
          { id: 1, file_type: "FILE" },
          { id: 2, file_type: "VIDEO" },
        ],
      },
    };

    (apiService.api.Files.Query as Mock).mockResolvedValue(mockResponse);

    const result = await apiService.getAllFilesInFolder(0);

    expect(result).toEqual([1, 2]);
  });

  it("should get download URLs", async () => {
    const apiService = new ApiService(apiToken);

    const mockResponse = {
      status: 200,
      body: {
        files: [{ id: 1, file_type: "FILE" }],
      },
    };

    (apiService.api.Files.Query as Mock).mockResolvedValue(mockResponse);

    const result = await apiService.getDownloadURLs([1], [2]);

    expect(result).toContain(apiService.getDownloadURL(1));
  });
});
