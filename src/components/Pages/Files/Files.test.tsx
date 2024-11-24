import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Files from "./Files";
import ApiService from "../../../services/Api";
import { IFile } from "@putdotio/api-client";

const mockFiles: IFile[] = [
  {
    id: 1,
    name: "file1.txt",
    file_type: "FILE",
    size: 1000,
    created_at: "2023-01-01T00:00:00",
  },
  {
    id: 2,
    name: "folder1",
    file_type: "FOLDER",
    size: 0,
    created_at: "2023-01-01T00:00:00",
  },
] as IFile[];

const mockApi = {
  getFiles: vi.fn().mockResolvedValue(mockFiles),
  createFolder: vi.fn(),
  deleteFiles: vi.fn(),
  moveFiles: vi.fn(),
  zipAndDownloadFiles: vi.fn(),
  getDownloadURLs: vi.fn().mockResolvedValue(["http://example.com"]),
  downloadFile: vi.fn(),
};

describe("Files component", () => {
  beforeEach(() => {});

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading spinner initially", async () => {
    render(<Files api={mockApi as unknown as ApiService} />);

    expect(screen.getByRole("status")).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText("file1.txt")).toBeInTheDocument()
    );
  });

  it("renders files after loading", async () => {
    render(<Files api={mockApi as unknown as ApiService} />);
    await waitFor(() =>
      expect(screen.getByText("file1.txt")).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByText("folder1")).toBeInTheDocument()
    );
    expect(screen.getByText("folder1")).toBeInTheDocument();
  });

  it("should fetch files at 5 second intervals", async () => {
    render(<Files api={mockApi as unknown as ApiService} />);

    await waitFor(() =>
      expect(screen.getByText("file1.txt")).toBeInTheDocument()
    );

    await waitFor(() => expect(mockApi.getFiles).toHaveBeenCalledTimes(2));
  });

  it("should show message when no files are present", async () => {
    const emptyFilesApi = {
      getFiles: vi.fn().mockResolvedValue([]),
    };

    render(<Files api={emptyFilesApi as unknown as ApiService} />);
    await waitFor(
      () => expect(screen.getByText("No files whatsoever!")).toBeInTheDocument
    );
  });

  it("download a file via table", async () => {
    render(<Files api={mockApi as unknown as ApiService} />);
    await waitFor(() =>
      expect(screen.getByText("file1.txt")).toBeInTheDocument()
    );

    const downloadButton = screen.getByRole("button", {
      name: "Download file1.txt",
    });

    fireEvent.click(downloadButton);

    await waitFor(() => expect(mockApi.downloadFile).toHaveBeenCalledWith(1));
  });

  it("zip and download file via table", async () => {
    render(<Files api={mockApi as unknown as ApiService} />);
    await waitFor(() =>
      expect(screen.getByText("file1.txt")).toBeInTheDocument()
    );

    const downloadButton = screen.getByRole("button", {
      name: "Download folder1",
    });

    fireEvent.click(downloadButton);

    await waitFor(() =>
      expect(mockApi.zipAndDownloadFiles).toHaveBeenCalledWith([2])
    );
  });

  it("selects and deselects all files", async () => {
    render(<Files api={mockApi as unknown as ApiService} />);
    await waitFor(() =>
      expect(screen.getByText("file1.txt")).toBeInTheDocument()
    );

    const selectAllCheckbox = screen.getByRole("checkbox", {
      name: "Select all files",
    });

    fireEvent.click(selectAllCheckbox);

    const fileCheckboxes = screen.getAllByRole("checkbox");

    for (const checkbox of fileCheckboxes) {
      expect(checkbox).toBeChecked();
    }

    fireEvent.click(selectAllCheckbox);

    for (const checkbox of fileCheckboxes) {
      expect(checkbox).not.toBeChecked();
    }
  });

  it("clicking a file selects/deselects", async () => {
    render(<Files api={mockApi as unknown as ApiService} />);
    await waitFor(() =>
      expect(screen.getByText("file1.txt")).toBeInTheDocument()
    );

    const fileCheckbox = screen.getAllByRole("checkbox")[1];

    const fileLink = screen.getByText("file1.txt", { exact: false });

    fireEvent.click(fileLink);

    await waitFor(() => expect(fileCheckbox).toBeChecked());

    fireEvent.click(fileLink);

    expect(fileCheckbox).not.toBeChecked();
  });

  it("move files", async () => {
    render(<Files api={mockApi as unknown as ApiService} />);

    await waitFor(() =>
      expect(screen.getByText("file1.txt")).toBeInTheDocument()
    );

    const fileCheckbox = screen.getAllByRole("checkbox")[1];

    fireEvent.click(fileCheckbox);

    const moveButton = screen.getByRole("button", { name: "Move file/folder" });

    fireEvent.click(moveButton);

    expect(screen.getByText("Move 1 File")).toBeInTheDocument();

    const moveFilesButton = screen.getByRole("button", { name: "Move here" });

    fireEvent.click(moveFilesButton);

    await waitFor(() => expect(mockApi.moveFiles).toHaveBeenCalledWith([1], 0));
  });

  it("get download links", async () => {
    render(<Files api={mockApi as unknown as ApiService} />);

    await waitFor(() =>
      expect(screen.getByText("file1.txt")).toBeInTheDocument()
    );

    const fileCheckbox = screen.getAllByRole("checkbox")[0];

    fireEvent.click(fileCheckbox);

    expect(fileCheckbox).toBeChecked();

    const getDownloadLinksButton = screen.getByRole("button", {
      name: "Get download links",
    });

    fireEvent.click(getDownloadLinksButton);

    await waitFor(() =>
      expect(mockApi.getDownloadURLs).toHaveBeenCalledWith([1], [2])
    );

    expect(screen.getByText("Download Links")).toBeInTheDocument();

    expect(screen.getByText("http://example.com")).toBeInTheDocument();

    const closeButton = screen.getByRole("button", { name: "Close" });

    fireEvent.click(closeButton);
  });

  it("navigate to folder and back up to root", async () => {
    render(<Files api={mockApi as unknown as ApiService} />);

    await waitFor(() =>
      expect(screen.getByText("file1.txt")).toBeInTheDocument()
    );

    const folderLink = screen.getByText("folder1", { exact: false });

    fireEvent.click(folderLink);

    const moveUpButton = screen.getByRole("button", {
      name: "Move up a directory",
    });

    expect(moveUpButton).not.toBeDisabled();

    fireEvent.click(moveUpButton);
  });

  it("add folder", async () => {
    render(<Files api={mockApi as unknown as ApiService} />);

    await waitFor(() =>
      expect(screen.getByText("file1.txt")).toBeInTheDocument()
    );

    const addFolderButton = screen.getByRole("button", { name: "Add folder" });

    fireEvent.click(addFolderButton);

    expect(screen.getByText("Add folder")).toBeInTheDocument();

    const closeModalButton = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeModalButton);

    expect(screen.queryByText("Add folder")).not.toBeInTheDocument();
  });

  it("deletes selected files", async () => {
    render(<Files api={mockApi as unknown as ApiService} />);

    await waitFor(() =>
      expect(screen.getByText("file1.txt")).toBeInTheDocument()
    );

    const fileCheckbox = screen.getAllByRole("checkbox")[1];
    fireEvent.click(fileCheckbox);
    expect(fileCheckbox).toBeChecked();

    const deleteButton = screen.getByRole("button", { name: "Delete files" });

    act(() => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => expect(mockApi.deleteFiles).toHaveBeenCalledWith([1]));
  });

  it("zip and download selected files", async () => {
    render(<Files api={mockApi as unknown as ApiService} />);

    await waitFor(() =>
      expect(screen.getByText("file1.txt")).toBeInTheDocument()
    );

    const fileCheckbox = screen.getAllByRole("checkbox")[1];
    fireEvent.click(fileCheckbox);
    expect(fileCheckbox).toBeChecked();

    const downloadButton = screen.getByRole("button", {
      name: "Zip and download",
    });

    act(() => {
      fireEvent.click(downloadButton);
    });

    await waitFor(() =>
      expect(mockApi.zipAndDownloadFiles).toHaveBeenCalledWith([1])
    );
  });

  it("handle action errors", async () => {
    const errorApi = {
      ...mockApi,
      createFolder: vi.fn().mockRejectedValue(new Error("test failure")),
    };

    render(<Files api={errorApi as unknown as ApiService} />);

    await waitFor(() =>
      expect(screen.getByText("file1.txt")).toBeInTheDocument()
    );

    const addFolderButton = screen.getByRole("button", { name: "Add folder" });

    fireEvent.click(addFolderButton);

    const folderNameInput = screen.getByLabelText("Folder name");

    fireEvent.change(folderNameInput, { target: { value: "new-folder" } });

    const createFolderButton = screen.getByRole("button", {
      name: "Add",
    });

    fireEvent.click(createFolderButton);

    await waitFor(() =>
      expect(screen.getByText("Error: test failure")).toBeInTheDocument()
    );
  });
});
