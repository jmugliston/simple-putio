import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, Mock, beforeEach } from "vitest";
import { Transfers } from "./Transfers";
import { ApiService } from "../../../services/Api";
import { Transfer } from "@putdotio/api-client";

vi.mock("../../../services/Api");

describe("Transfers Component", () => {
  const mockApi: ApiService = {
    getTransfers: vi.fn(),
  } as unknown as ApiService;

  const mockTransfers: Transfer[] = [
    {
      id: 1,
      name: "Test Transfer 1",
      status: "COMPLETED",
      finished_at: new Date().toISOString(),
      percent_done: 100,
    },
    {
      id: 2,
      name: "Test Transfer 2",
      status: "DOWNLOADING",
      finished_at: null,
      percent_done: 50,
    },
    {
      id: 3,
      name: "Test Transfer 3",
      status: "DOWNLOADING",
      finished_at: null,
      percent_done: 0,
    },
  ] as Transfer[];

  beforeEach(() => {
    (mockApi.getTransfers as Mock).mockResolvedValue(mockTransfers);
  });

  it("renders 'No transfers whatsoever!' when there are no transfers", async () => {
    (mockApi.getTransfers as Mock).mockResolvedValueOnce([]);
    render(<Transfers api={mockApi} />);

    await waitFor(() => {
      expect(screen.getByText("No transfers whatsoever!")).toBeInTheDocument();
    });
  });

  it("renders transfers correctly", async () => {
    render(<Transfers api={mockApi} />);

    await waitFor(() => {
      expect(screen.getByText("Test Transfer 1")).toBeInTheDocument();
      expect(screen.getByText("Test Transfer 2")).toBeInTheDocument();
    });
  });

  it("displays the correct status and progress", async () => {
    render(<Transfers api={mockApi} />);

    await waitFor(() => {
      expect(
        screen.getByText("Test Transfer 1").parentElement
        // Content is split accross divs
      ).toHaveTextContent("Test Transfer 1Completed (< 1 minute ago)");

      expect(
        screen.getByText("Test Transfer 2").parentElement
        // Content is split accross divs
      ).toHaveTextContent("Test Transfer 2Downloading (50%)");
    });
  });
});
