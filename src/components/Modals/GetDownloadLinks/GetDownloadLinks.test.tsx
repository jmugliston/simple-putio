import { test, describe, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import copy from "copy-to-clipboard";

import { GetDownloadLinks, GetDownloadLinksProps } from "./GetDownloadLinks";

vi.mock("copy-to-clipboard", () => ({
  default: vi.fn(),
}));

describe("Get download links modal", () => {
  const defaultProps = {
    closeModal: vi.fn(),
    modalIsOpen: true,
    links: ["link1", "link2"],
  } as GetDownloadLinksProps;

  test("show download links", () => {
    render(<GetDownloadLinks {...defaultProps} />);
    expect(screen.getByText("Download Links"));
    expect(screen.getByRole("textbox")).toHaveValue("link1\nlink2");
  });

  test("copy links to clipboard", () => {
    render(<GetDownloadLinks {...defaultProps} />);
    const copyButton = screen.getByRole("button", { name: "Copy" });
    fireEvent.click(copyButton);
    expect(copy).toHaveBeenCalledWith("link1\nlink2");
  });

  test("close modal", () => {
    render(<GetDownloadLinks {...defaultProps} />);
    const closeButton = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeButton);
    expect(defaultProps.closeModal).toHaveBeenCalled();
  });
});
