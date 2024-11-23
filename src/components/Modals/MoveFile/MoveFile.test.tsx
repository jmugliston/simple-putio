import { test, describe, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { MoveFile, MoveFileProps } from "./MoveFile";

import ApiService from "../../../services/Api";

describe("Move file modal", () => {
  test("move a file", async () => {
    const props = {
      closeModal: vi.fn(),
      modalIsOpen: true,
      api: {
        getFiles: vi
          .fn()
          // Initial load
          .mockResolvedValueOnce([
            { id: 1, file_type: "FILE", name: "File 1" },
            { id: 2, file_type: "FOLDER", name: "Folder 1" },
          ])
          // Inside folder 1
          .mockResolvedValueOnce([
            { id: 3, file_type: "FOLDER", name: "Folder 2" },
          ])
          // Inside folder 2
          .mockResolvedValueOnce([]),
      } as unknown as ApiService,
      fileIds: [1],
    } as MoveFileProps;

    render(<MoveFile {...props} />);
    expect(screen.getByText(`Move 1 File`));

    await waitFor(() =>
      expect(screen.getByText("Folder 1")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText("Folder 1"));

    await waitFor(() => {
      expect(screen.getByText("Folder 2")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Move here"));

    expect(props.closeModal).toHaveBeenCalledWith(2);
  });

  test("move multiple files", async () => {
    const props = {
      closeModal: vi.fn(),
      modalIsOpen: true,
      api: {
        getFiles: vi
          .fn()
          // Initial load
          .mockResolvedValueOnce([
            { id: 1, file_type: "FILE", name: "File 1" },
            { id: 2, file_type: "FILE", name: "File 2" },
            { id: 3, file_type: "FILE", name: "File 3" },
            { id: 4, file_type: "FOLDER", name: "Folder 1" },
          ])
          // Inside folder 1
          .mockResolvedValue([]),
      } as unknown as ApiService,
      fileIds: [1, 2, 3],
    } as MoveFileProps;

    render(<MoveFile {...props} />);
    expect(screen.getByText(`Move 3 Files`));

    await waitFor(() =>
      expect(screen.getByText("Folder 1")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText("Folder 1"));

    fireEvent.click(screen.getByText("Move here"));

    expect(props.closeModal).toHaveBeenCalledWith(4);
  });

  test("move a folder", async () => {
    const props = {
      closeModal: vi.fn(),
      modalIsOpen: true,
      api: {
        getFiles: vi
          .fn()
          // Initial load
          .mockResolvedValueOnce([
            { id: 1, file_type: "FOLDER", name: "Folder 1" },
            { id: 2, file_type: "FOLDER", name: "Folder 2" },
          ])
          // Inside folder 2
          .mockResolvedValueOnce([
            { id: 3, file_type: "FOLDER", name: "Folder 3" },
          ])
          // Inside folder 3
          .mockResolvedValueOnce([]),
      } as unknown as ApiService,
      fileIds: [1],
    } as MoveFileProps;

    render(<MoveFile {...props} />);
    expect(screen.getByText(`Move 1 File`));

    await waitFor(() =>
      expect(screen.getByText("Folder 2")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText("Folder 2"));

    await waitFor(() => {
      expect(screen.getByText("Folder 3")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Move here"));

    expect(props.closeModal).toHaveBeenCalledWith(2);
  });

  test("breadcrumb navigation", async () => {
    const props = {
      closeModal: vi.fn(),
      modalIsOpen: true,
      api: {
        getFiles: vi
          .fn()
          // Initial load
          .mockResolvedValueOnce([
            { id: 2, file_type: "FOLDER", name: "Folder 1" },
          ])
          // Inside folder 1
          .mockResolvedValueOnce([
            { id: 3, file_type: "FOLDER", name: "Folder 2" },
          ])
          // Inside folder 2
          .mockResolvedValueOnce([
            { id: 4, file_type: "FOLDER", name: "Folder 3" },
          ])
          // Navigate to folder 1 via breadcrumbs
          .mockResolvedValueOnce([
            { id: 3, file_type: "FOLDER", name: "Folder 2" },
          ]),
      } as unknown as ApiService,
      fileIds: [1],
    } as MoveFileProps;

    render(<MoveFile {...props} />);
    expect(screen.getByText(`Move 1 File`));

    // ---- Navigate down 2 levels ----

    await waitFor(() =>
      expect(screen.getByText("Folder 1")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText("Folder 1"));

    await waitFor(() => {
      expect(screen.getByText("Folder 2")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Folder 2"));

    await waitFor(() => {
      expect(screen.getByText("Folder 3")).toBeInTheDocument();
    });

    // Navigate back up using breadcrumbs

    fireEvent.click(screen.getByRole("button", { name: "breadcrumb-file-2" }));

    await waitFor(() => {
      expect(screen.getByText("Folder 2")).toBeInTheDocument();
    });
  });

  test("close modal", async () => {
    const props = {
      closeModal: vi.fn().mockResolvedValueOnce([]),
      modalIsOpen: true,
      api: {
        getFiles: vi
          .fn()
          .mockResolvedValue([
            { id: 2, file_type: "FOLDER", name: "Folder 1" },
          ]),
      } as unknown as ApiService,
      fileIds: [1],
    } as MoveFileProps;
    render(<MoveFile {...props} />);

    await waitFor(() =>
      expect(screen.getByText("Folder 1")).toBeInTheDocument()
    );

    const closeButton = screen.getByRole("button", { name: "Close" });

    fireEvent.click(closeButton);

    expect(props.closeModal).toHaveBeenCalled();
  });
});
