import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Spinner } from "./Spinner";

describe("Spinner component", () => {
  it("renders", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("contains an SVG element", () => {
    render(<Spinner />);
    expect(screen.getByRole("status").querySelector("svg")).toBeInTheDocument();
  });

  it("has the correct aria-hidden attribute on the SVG", () => {
    render(<Spinner />);
    expect(screen.getByRole("status").querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
  });

  it("contains a span with the correct text", () => {
    render(<Spinner />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
