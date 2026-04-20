import { describe, it, expect } from "vitest";
import { normalizeLevel } from "../src/types/index.js";

describe("Types - normalizeLevel", () => {
  it("should return the same level if it's not an alias", () => {
    expect(normalizeLevel("INFO")).toBe("INFO");
    expect(normalizeLevel("DEBUG")).toBe("DEBUG");
  });

  it("should uppercase the result", () => {
    expect(normalizeLevel("info")).toBe("INFO");
  });

  it("should normalize known aliases", () => {
    expect(normalizeLevel("WARNING")).toBe("WARN");
    expect(normalizeLevel("EXCEPTION")).toBe("ERROR");
    expect(normalizeLevel("SEVERE")).toBe("ERROR");
    expect(normalizeLevel("FAIL")).toBe("ERROR");
    expect(normalizeLevel("FAILURE")).toBe("ERROR");
    expect(normalizeLevel("CRITICAL")).toBe("FATAL");
  });

  it("should normalize mixed-case aliases", () => {
    expect(normalizeLevel("Warning")).toBe("WARN");
    expect(normalizeLevel("severe")).toBe("ERROR");
  });
});
