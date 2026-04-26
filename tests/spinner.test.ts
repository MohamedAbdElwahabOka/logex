import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock ora ────────────────────────────────────────────────────
// We create a fake Ora object so we can verify start/succeed/fail
// without actual terminal rendering.
const mockOra = {
  start: vi.fn(),
  succeed: vi.fn(),
  fail: vi.fn(),
  stop: vi.fn(),
  text: "",
  color: "" as string,
  spinner: "" as string,
};

// Make start() return the same object (ora is chainable)
mockOra.start.mockReturnValue(mockOra);

vi.mock("ora", () => ({
  default: vi.fn(() => mockOra),
}));

import { createSpinner, withSpinner } from "../src/ui/spinner.js";
import ora from "ora";

describe("Spinner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOra.start.mockReturnValue(mockOra);
  });

  // ── createSpinner() ──────────────────────────────────────────

  describe("createSpinner()", () => {
    it("should call ora with correct options", () => {
      createSpinner("Loading...");
      expect(ora).toHaveBeenCalledWith({
        text: "Loading...",
        color: "magenta",
        spinner: "dots2",
      });
    });

    it("should call start() on the returned spinner", () => {
      createSpinner("Parsing");
      expect(mockOra.start).toHaveBeenCalled();
    });

    it("should return the ora instance", () => {
      const spinner = createSpinner("Test");
      expect(spinner).toBe(mockOra);
    });
  });

  // ── withSpinner() ────────────────────────────────────────────

  describe("withSpinner()", () => {
    it("should call succeed with successText on success", async () => {
      const operation = vi.fn().mockResolvedValue("result");

      const result = await withSpinner("Analyzing", operation, "Done!");

      expect(result).toBe("result");
      expect(mockOra.succeed).toHaveBeenCalledWith("Done!");
      expect(mockOra.fail).not.toHaveBeenCalled();
    });

    it("should call succeed with the original text when no successText given", async () => {
      const operation = vi.fn().mockResolvedValue(42);

      await withSpinner("Processing", operation);

      expect(mockOra.succeed).toHaveBeenCalledWith("Processing");
    });

    it("should return the value from the async operation", async () => {
      const data = { entries: 100 };
      const operation = vi.fn().mockResolvedValue(data);

      const result = await withSpinner("Fetching", operation);

      expect(result).toEqual(data);
    });

    it("should call fail and re-throw on operation error", async () => {
      const error = new Error("Network timeout");
      const operation = vi.fn().mockRejectedValue(error);

      await expect(
        withSpinner("Connecting", operation),
      ).rejects.toThrow("Network timeout");

      expect(mockOra.fail).toHaveBeenCalledWith("Failed: Connecting");
      expect(mockOra.succeed).not.toHaveBeenCalled();
    });

    it("should create a spinner with the provided text", async () => {
      const operation = vi.fn().mockResolvedValue(null);

      await withSpinner("Scanning", operation);

      expect(ora).toHaveBeenCalledWith(
        expect.objectContaining({ text: "Scanning" }),
      );
    });

    it("should await the operation before calling succeed", async () => {
      const callOrder: string[] = [];
      const operation = vi.fn().mockImplementation(async () => {
        callOrder.push("operation");
        return "done";
      });
      mockOra.succeed.mockImplementation(() => {
        callOrder.push("succeed");
      });

      await withSpinner("Working", operation);

      expect(callOrder).toEqual(["operation", "succeed"]);
    });
  });
});
