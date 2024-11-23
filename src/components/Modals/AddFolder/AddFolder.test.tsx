import { test, describe, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

import { AddFolder, AddFolderProps } from "./AddFolder";

describe("Add folder modal", () => {
  const defaultProps = {
    closeModal: vi.fn(),
    modalIsOpen: true,
  } as AddFolderProps;

  test("add folder", () => {
    render(<AddFolder {...defaultProps} />);
    expect(screen.getByText("Add folder"));

    const folderName = "new folder";
    const input = screen.getByPlaceholderText("Folder name");

    fireEvent.change(input, { target: { value: folderName } });

    expect((input as HTMLInputElement).value).toBe(folderName);

    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(defaultProps.closeModal).toHaveBeenCalledWith(folderName);
  });

  test("close modal", () => {
    render(<AddFolder {...defaultProps} />);
    const closeButton = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeButton);
    expect(defaultProps.closeModal).toHaveBeenCalled();
  });
});
