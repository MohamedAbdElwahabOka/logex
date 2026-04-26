import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  renderAnalysisTable,
  renderFilteredTable,
  renderCompactSummary,
} from "../src/ui/table.js";
import type { AnalysisResult, LogEntry } from "../src/types/index.js";

describe("Table", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  // ── Fixtures ───────────────────────────────────────────────────

  function makeAnalysisResult(
    overrides: Partial<AnalysisResult> = {},
  ): AnalysisResult {
    return {
      totalEntries: 100,
      totalLines: 120,
      levelCounts: { ERROR: 30, WARN: 20, INFO: 40, DEBUG: 10 },
      levelPercentages: {
        ERROR: "30.0",
        WARN: "20.0",
        INFO: "40.0",
        DEBUG: "10.0",
      },
      topMessages: [
        { message: "Connection refused", count: 15 },
        { message: "Timeout expired", count: 10 },
      ],
      filePath: null,
      fileSize: null,
      ...overrides,
    };
  }

  function makeLogEntry(overrides: Partial<LogEntry> = {}): LogEntry {
    return {
      lineNumber: 1,
      level: "ERROR",
      message: "Something went wrong",
      raw: "2024-01-15T10:30:00Z [ERROR] Something went wrong",
      ...overrides,
    };
  }

  // ── renderAnalysisTable() ──────────────────────────────────────

  describe("renderAnalysisTable()", () => {
    it("should not throw", () => {
      expect(() => renderAnalysisTable(makeAnalysisResult())).not.toThrow();
    });

    it("should print the Analysis Overview header", () => {
      renderAnalysisTable(makeAnalysisResult());
      const allOutput = consoleSpy.mock.calls.map((c) => String(c[0])).join("\n");
      expect(allOutput).toContain("Analysis Overview");
    });

    it("should print the Severity Breakdown header", () => {
      renderAnalysisTable(makeAnalysisResult());
      const allOutput = consoleSpy.mock.calls.map((c) => String(c[0])).join("\n");
      expect(allOutput).toContain("Severity Breakdown");
    });

    it("should print the Level Distribution header", () => {
      renderAnalysisTable(makeAnalysisResult());
      const allOutput = consoleSpy.mock.calls.map((c) => String(c[0])).join("\n");
      expect(allOutput).toContain("Level Distribution");
    });

    it("should print the Top Messages header when messages exist", () => {
      renderAnalysisTable(makeAnalysisResult());
      const allOutput = consoleSpy.mock.calls.map((c) => String(c[0])).join("\n");
      expect(allOutput).toContain("Top Messages");
    });

    it("should NOT print Top Messages when topMessages is empty", () => {
      renderAnalysisTable(makeAnalysisResult({ topMessages: [] }));
      const allOutput = consoleSpy.mock.calls.map((c) => String(c[0])).join("\n");
      expect(allOutput).not.toContain("Top Messages");
    });

    it("should include fileSize when provided", () => {
      renderAnalysisTable(makeAnalysisResult({ fileSize: "2.5 MB" }));
      const allOutput = consoleSpy.mock.calls.map((c) => String(c[0])).join("\n");
      expect(allOutput).toContain("2.5 MB");
    });

    it("should include time range when timestamps are provided", () => {
      const result = makeAnalysisResult({
        earliestTimestamp: new Date("2024-01-15T08:00:00Z"),
        latestTimestamp: new Date("2024-01-15T18:00:00Z"),
      });
      renderAnalysisTable(result);
      const allOutput = consoleSpy.mock.calls.map((c) => String(c[0])).join("\n");
      expect(allOutput).toContain("Time Range Start");
      expect(allOutput).toContain("Time Range End");
    });

    it("should NOT include time range when timestamps are missing", () => {
      renderAnalysisTable(makeAnalysisResult());
      const allOutput = consoleSpy.mock.calls.map((c) => String(c[0])).join("\n");
      expect(allOutput).not.toContain("Time Range Start");
    });

    it("should truncate long top messages to 55 chars + ellipsis", () => {
      const longMsg = "A".repeat(80);
      const result = makeAnalysisResult({
        topMessages: [{ message: longMsg, count: 5 }],
      });
      renderAnalysisTable(result);
      const allOutput = consoleSpy.mock.calls.map((c) => String(c[0])).join("\n");
      // Should contain the truncated portion
      expect(allOutput).toContain("A".repeat(55));
      expect(allOutput).toContain("…");
    });
  });

  // ── renderFilteredTable() ──────────────────────────────────────

  describe("renderFilteredTable()", () => {
    it("should not throw with valid entries", () => {
      expect(() => renderFilteredTable([makeLogEntry()])).not.toThrow();
    });

    it("should print a warning when entries array is empty", () => {
      renderFilteredTable([]);
      const allOutput = consoleSpy.mock.calls.map((c) => String(c[0])).join("\n");
      expect(allOutput).toContain("No entries matched");
    });

    it("should not print the table header when entries is empty", () => {
      renderFilteredTable([]);
      const allOutput = consoleSpy.mock.calls.map((c) => String(c[0])).join("\n");
      expect(allOutput).not.toContain("Filtered Results");
    });

    it("should print the Filtered Results header when entries exist", () => {
      renderFilteredTable([makeLogEntry()]);
      const allOutput = consoleSpy.mock.calls.map((c) => String(c[0])).join("\n");
      expect(allOutput).toContain("Filtered Results");
    });

    it("should display entry count in the header", () => {
      const entries = [makeLogEntry(), makeLogEntry({ lineNumber: 2 })];
      renderFilteredTable(entries);
      const allOutput = consoleSpy.mock.calls.map((c) => String(c[0])).join("\n");
      expect(allOutput).toContain("2 entries");
    });

    it("should truncate messages longer than 55 chars", () => {
      const longMsg = "B".repeat(80);
      renderFilteredTable([makeLogEntry({ message: longMsg })]);
      const allOutput = consoleSpy.mock.calls.map((c) => String(c[0])).join("\n");
      expect(allOutput).toContain("B".repeat(55));
      expect(allOutput).toContain("…");
    });

    it("should respect the maxRows limit", () => {
      const entries = Array.from({ length: 10 }, (_, i) =>
        makeLogEntry({ lineNumber: i + 1, message: `msg ${i}` }),
      );
      renderFilteredTable(entries, 3);
      const allOutput = consoleSpy.mock.calls.map((c) => String(c[0])).join("\n");
      // Should show the overflow message
      expect(allOutput).toContain("7 more entries");
    });

    it("should NOT show overflow message when entries fit within maxRows", () => {
      const entries = [makeLogEntry()];
      renderFilteredTable(entries, 50);
      const allOutput = consoleSpy.mock.calls.map((c) => String(c[0])).join("\n");
      expect(allOutput).not.toContain("more entries");
    });

    it("should include line numbers in the output", () => {
      renderFilteredTable([makeLogEntry({ lineNumber: 42 })]);
      const allOutput = consoleSpy.mock.calls.map((c) => String(c[0])).join("\n");
      expect(allOutput).toContain("42");
    });
  });

  // ── renderCompactSummary() ─────────────────────────────────────

  describe("renderCompactSummary()", () => {
    it("should not throw", () => {
      expect(() => renderCompactSummary(makeAnalysisResult())).not.toThrow();
    });

    it("should call console.log exactly once", () => {
      renderCompactSummary(makeAnalysisResult());
      expect(consoleSpy).toHaveBeenCalledTimes(1);
    });

    it("should contain the bullet separator '•'", () => {
      renderCompactSummary(makeAnalysisResult());
      const output = consoleSpy.mock.calls[0][0] as string;
      expect(output).toContain("•");
    });

    it("should include all level names in the output", () => {
      renderCompactSummary(makeAnalysisResult());
      const output = consoleSpy.mock.calls[0][0] as string;
      expect(output).toContain("ERROR");
      expect(output).toContain("WARN");
      expect(output).toContain("INFO");
      expect(output).toContain("DEBUG");
    });

    it("should work with a single level", () => {
      const result = makeAnalysisResult({
        levelCounts: { FATAL: 5 },
        levelPercentages: { FATAL: "100.0" },
      });
      renderCompactSummary(result);
      const output = consoleSpy.mock.calls[0][0] as string;
      expect(output).toContain("FATAL");
    });

    it("should work with empty level counts", () => {
      const result = makeAnalysisResult({
        levelCounts: {},
        levelPercentages: {},
      });
      expect(() => renderCompactSummary(result)).not.toThrow();
    });
  });
});
