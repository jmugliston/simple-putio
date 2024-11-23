import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Footer } from "./Footer";
import { ApiService } from "../../services/Api";

vi.mock("../../services/Api", () => ({
  ApiService: vi.fn(() => ({
    getDiskInfo: vi.fn().mockResolvedValue({ used: 50, free: 50 }),
  })),
}));

describe("Footer component", () => {
  it("renders", async () => {
    const api = new ApiService("");
    render(<Footer api={api} />);
    await waitFor(() => expect(screen.getByText(/Used:/)).toBeInTheDocument());
  });

  it("displays disk info correctly", async () => {
    const api = new ApiService("");

    render(<Footer api={api} />);

    expect(api.getDiskInfo).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.getByText(/Used: 50%/)).toBeInTheDocument();
      expect(screen.getByText(/50GB Free/)).toBeInTheDocument();
    });
  });
});
