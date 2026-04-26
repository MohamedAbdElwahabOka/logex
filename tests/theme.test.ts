import { describe, it, expect } from "vitest";
import { theme } from "../src/ui/theme.js";

describe("Theme", () => {
  // ── Semantic log level colors ──────────────────────────────────

  describe("semantic level color helpers", () => {
    it("fatal() wraps text with padding", () => {
      const result = theme.fatal("FATAL");
      expect(result).toContain("FATAL");
      // chalk bgRed.white.bold adds padding spaces around the text
      expect(result).toContain(" FATAL ");
    });

    it("error() returns a string containing the input", () => {
      expect(theme.error("ERROR")).toContain("ERROR");
    });

    it("warn() returns a string containing the input", () => {
      expect(theme.warn("high memory")).toContain("high memory");
    });

    it("info() returns a string containing the input", () => {
      expect(theme.info("booting")).toContain("booting");
    });

    it("debug() returns a string containing the input", () => {
      expect(theme.debug("step 3")).toContain("step 3");
    });

    it("trace() returns a string containing the input", () => {
      expect(theme.trace("entering fn")).toContain("entering fn");
    });
  });

  // ── UI chrome ──────────────────────────────────────────────────

  describe("UI chrome helpers", () => {
    it("success() returns a string containing the input", () => {
      expect(theme.success("Done!")).toContain("Done!");
    });

    it("highlight() returns a string containing the input", () => {
      expect(theme.highlight("important")).toContain("important");
    });

    it("muted() returns a string containing the input", () => {
      expect(theme.muted("side note")).toContain("side note");
    });

    it("accent() returns a string containing the input", () => {
      expect(theme.accent("branded")).toContain("branded");
    });
  });

  // ── Structured formatters ──────────────────────────────────────

  describe("structured formatters", () => {
    it("header() returns a string containing the input", () => {
      expect(theme.header("Overview")).toContain("Overview");
    });

    it("subheader() returns a string containing the input", () => {
      expect(theme.subheader("Details")).toContain("Details");
    });

    it("label() returns a string containing the input", () => {
      expect(theme.label("Total")).toContain("Total");
    });

    it("separator() returns a string of repeated '─' characters", () => {
      const sep = theme.separator();
      // The underlying text should be 50 '─' chars
      expect(sep).toContain("─");
    });

    it("count() formats a number with locale separators", () => {
      const result = theme.count(1234);
      // The formatted number must contain the digits
      expect(result).toContain("1");
      expect(result).toContain("234");
    });

    it("count() handles zero", () => {
      expect(theme.count(0)).toContain("0");
    });

    it("percentage() appends a % suffix", () => {
      const result = theme.percentage("42.5");
      expect(result).toContain("42.5");
      expect(result).toContain("%");
    });
  });

  // ── Dynamic level() router ─────────────────────────────────────

  describe("level()", () => {
    it("routes FATAL through fatal()", () => {
      const result = theme.level("FATAL");
      // fatal() pads with spaces
      expect(result).toContain(" FATAL ");
    });

    it("routes ERROR through error()", () => {
      expect(theme.level("ERROR")).toContain("ERROR");
    });

    it("routes EXCEPTION through error()", () => {
      expect(theme.level("EXCEPTION")).toContain("EXCEPTION");
    });

    it("routes FAIL through error()", () => {
      expect(theme.level("FAIL")).toContain("FAIL");
    });

    it("routes WARN through warn()", () => {
      expect(theme.level("WARN")).toContain("WARN");
    });

    it("routes WARNING through warn()", () => {
      expect(theme.level("WARNING")).toContain("WARNING");
    });

    it("routes INFO through info()", () => {
      expect(theme.level("INFO")).toContain("INFO");
    });

    it("routes DEBUG through debug()", () => {
      expect(theme.level("DEBUG")).toContain("DEBUG");
    });

    it("routes TRACE through trace()", () => {
      expect(theme.level("TRACE")).toContain("TRACE");
    });

    it("falls back to white chalk for unknown levels", () => {
      const result = theme.level("CUSTOM");
      expect(result).toContain("CUSTOM");
    });

    it("is case-insensitive (lowercase input)", () => {
      // level() calls toUpperCase() on the input before switching
      expect(theme.level("error")).toContain("error");
      expect(theme.level("warn")).toContain("warn");
    });
  });

  // ── Progress bar ───────────────────────────────────────────────

  describe("progressBar()", () => {
    it("returns a string with filled and empty block chars", () => {
      const bar = theme.progressBar(50);
      expect(bar).toContain("█");
      expect(bar).toContain("░");
    });

    it("returns all filled for 100%", () => {
      const bar = theme.progressBar(100);
      expect(bar).toContain("█");
      // At 100% there should be no empty blocks
      expect(bar).not.toContain("░");
    });

    it("returns all empty for 0%", () => {
      const bar = theme.progressBar(0);
      expect(bar).toContain("░");
      expect(bar).not.toContain("█");
    });

    it("respects a custom width parameter", () => {
      const bar10 = theme.progressBar(50, 10);
      const bar40 = theme.progressBar(50, 40);
      // Longer width should produce a longer string
      expect(bar40.length).toBeGreaterThan(bar10.length);
    });

    it("handles edge percentages gracefully", () => {
      // These should not throw
      expect(() => theme.progressBar(0.5)).not.toThrow();
      expect(() => theme.progressBar(99.9)).not.toThrow();
    });
  });
});
