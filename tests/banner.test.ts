import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { showBanner, showMiniHeader } from "../src/ui/banner.js";

describe("Banner", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  // ── showBanner() ───────────────────────────────────────────────

  describe("showBanner()", () => {
    it("should call console.log at least 3 times (ascii, info box, blank line)", () => {
      showBanner();
      // colored ascii + boxen info + trailing blank line
      expect(consoleSpy).toHaveBeenCalledTimes(3);
    });

    it("should print the figlet ASCII art (gradient-colored)", () => {
      showBanner();
      // First call is the gradient-colored figlet output
      const asciiOutput = consoleSpy.mock.calls[0][0] as string;
      expect(typeof asciiOutput).toBe("string");
      expect(asciiOutput.length).toBeGreaterThan(0);
    });

    it("should print a boxen info line containing the version string", () => {
      showBanner();
      // Second call is the boxen-wrapped version info
      const infoOutput = consoleSpy.mock.calls[1][0] as string;
      expect(infoOutput).toContain("v1.0.0");
    });

    it("should include 'Log Analysis Toolkit' in the info box", () => {
      showBanner();
      const infoOutput = consoleSpy.mock.calls[1][0] as string;
      expect(infoOutput).toContain("Log Analysis Toolkit");
    });

    it("should print a trailing blank line", () => {
      showBanner();
      // Third call: console.log() with no arguments
      expect(consoleSpy.mock.calls[2]).toEqual([]);
    });

    it("should not throw", () => {
      expect(() => showBanner()).not.toThrow();
    });
  });

  // ── showMiniHeader() ──────────────────────────────────────────

  describe("showMiniHeader()", () => {
    it("should call console.log exactly once", () => {
      showMiniHeader();
      expect(consoleSpy).toHaveBeenCalledTimes(1);
    });

    it("should contain the version string v0.3.0", () => {
      showMiniHeader();
      const output = consoleSpy.mock.calls[0][0] as string;
      expect(output).toContain("v0.3.0");
    });

    it("should contain the 'logex' text", () => {
      showMiniHeader();
      const output = consoleSpy.mock.calls[0][0] as string;
      expect(output).toContain("logex");
    });

    it("should not throw", () => {
      expect(() => showMiniHeader()).not.toThrow();
    });
  });
});
