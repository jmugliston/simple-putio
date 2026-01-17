import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, MockedFunction, MockedClass } from "vitest";
import App from "./App";
import { useApiToken } from "./hooks/ApiToken";
import { ApiService } from "./services/Api";

vi.mock("./hooks/ApiToken");
const mockedUseApiToken = useApiToken as MockedFunction<typeof useApiToken>;

vi.mock("./services/Api");
const mockedApiService = ApiService as MockedClass<typeof ApiService>;

mockedApiService.prototype.getDiskInfo = vi
  .fn()
  .mockResolvedValue({ used: 0, free: 0 });
mockedApiService.prototype.getFiles = vi.fn().mockResolvedValue([]);
mockedApiService.prototype.getTransfers = vi.fn().mockResolvedValue([]);
mockedApiService.prototype.clearTransfers = vi.fn().mockResolvedValue(null);

describe("App Component", () => {
  it("renders login button when no apiToken", () => {
    mockedUseApiToken.mockReturnValue({
      apiToken: "",
      getAuth: vi.fn(),
    });

    render(<App />);

    expect(screen.getByText("Log in to Put.io")).toBeInTheDocument();
  });

  it("calls getAuth when login button is clicked", () => {
    const getAuthMock = vi.fn();
    mockedUseApiToken.mockReturnValue({
      apiToken: "",
      getAuth: getAuthMock,
    });

    render(<App />);

    fireEvent.click(screen.getByText("Log in to Put.io"));
    expect(getAuthMock).toHaveBeenCalled();
  });

  it("renders Files tab by default when apiToken is present", async () => {
    mockedUseApiToken.mockReturnValue({
      apiToken: "test-token",
      getAuth: vi.fn(),
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Files")).toBeInTheDocument();
      expect(screen.getByText("Transfers")).toBeInTheDocument();
    });
  });

  it("switches to Transfers tab when clicked", async () => {
    mockedUseApiToken.mockReturnValue({
      apiToken: "test-token",
      getAuth: vi.fn(),
    });

    render(<App />);

    await waitFor(() => {
      fireEvent.click(screen.getByText("Transfers"));
    });
    
    await waitFor(() => {
      expect(screen.getByText("Clear Finished")).toBeInTheDocument();
    });
  });

  it("clear in progress transfers", async () => {
    mockedUseApiToken.mockReturnValue({
      apiToken: "test-token",
      getAuth: vi.fn(),
    });

    render(<App />);

    await waitFor(() => {
      fireEvent.click(screen.getByText("Transfers"));
    });

    await waitFor(() => {
      fireEvent.click(screen.getByText("Clear Finished"));
    });

    expect(mockedApiService.prototype.clearTransfers).toHaveBeenCalled();
  });
});
