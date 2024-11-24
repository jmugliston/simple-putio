import { describe, it, expect } from "vitest";
import { formatBytes, customTimeFormatter, truncate } from "./index";

describe("helpers", () => {
  it("should format bytes correctly", () => {
    expect(formatBytes(1024)).toBe("1 KiB");
    expect(formatBytes(1048576)).toBe("1 MiB");
    expect(formatBytes(0)).toBe("0 Bytes");
    expect(formatBytes(123456789)).toBe("117.74 MiB");
  });

  it("should truncate strings correctly", () => {
    expect(truncate("Hello World", 5)).toBe("Hell...");
    expect(truncate("Hello World", 20)).toBe("Hello World");
    expect(truncate("Hello World")).toBe("Hello World");
  });

  it("should format custom time correctly", () => {
    const nextFormatter = (value: number, unit: string, suffix: string) =>
      `${value} ${unit} ${suffix}`;
    expect(customTimeFormatter(30, "second", "ago", 0, nextFormatter)).toBe(
      "< 1 minute ago"
    );
    expect(customTimeFormatter(90, "second", "ago", 0, nextFormatter)).toBe(
      "90 second ago"
    );
  });
});
