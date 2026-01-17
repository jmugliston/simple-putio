import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import copy from "copy-to-clipboard";

import { ZipDownloadReady } from "./ZipDownloadReady";

vi.mock("copy-to-clipboard", () => ({
  default: vi.fn(),
}));

describe("Zip download ready notification", () => {
  const link = "http://example.com/file.zip";
  const size = 1024;

  it("renders download link and size", () => {
    render(<ZipDownloadReady link={link} size={size} />);

    const downloadLink = screen.getByText(/Download zip file/i);

    expect(downloadLink).toBeInTheDocument();
    expect(downloadLink).toHaveAttribute("href", link);

    const sizeText = screen.getByText("1 KiB");
    expect(sizeText).toBeInTheDocument();
  });

  it("copies link to clipboard when button is clicked", async () => {
    render(<ZipDownloadReady link={link} size={size} />);

    const copyButton = screen.getByRole("button", { name: "Copy" });

    await waitFor(() => {
      fireEvent.click(copyButton);
    });

    expect(copy).toHaveBeenCalledWith("http://example.com/file.zip");
  });
});
