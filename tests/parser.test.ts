import { describe, it, expect } from "vitest";
import {
  detectLevelFromMessage,
  parseLine,
  parseTimestamp,
} from "../src/core/parser.js";

describe("Parser Core", () => {
  describe("detectLevelFromMessage", () => {
    it("should detect FATAL", () => {
      expect(detectLevelFromMessage("Something FATAL happened")).toBe("FATAL");
    });

    it("should detect ERROR", () => {
      expect(detectLevelFromMessage("An ERROR occurred")).toBe("ERROR");
    });

    it("should return INFO by default if no keyword matches", () => {
      expect(detectLevelFromMessage("Just a normal log line without keywords")).toBe("INFO");
    });

    it("should handle case insensitivity", () => {
      expect(detectLevelFromMessage("System warn: memory low")).toBe("WARN");
      expect(detectLevelFromMessage("debug message here")).toBe("DEBUG");
    });

    it("should require word boundaries", () => {
      // "informative" contains "info", but it's not the word "info"
      expect(detectLevelFromMessage("Very informative message")).toBe("INFO");
      // "failover" contains "fail"
      expect(detectLevelFromMessage("Database failover triggered")).toBe("INFO");
    });
  });

  describe("parseTimestamp", () => {
    it("should parse valid ISO date strings", () => {
      const date = parseTimestamp("2024-01-15T10:30:00Z");
      expect(date).toBeInstanceOf(Date);
      expect(date?.toISOString()).toBe("2024-01-15T10:30:00.000Z");
    });

    it("should return undefined for invalid dates", () => {
      expect(parseTimestamp("not-a-date")).toBeUndefined();
    });
  });

  describe("parseLine", () => {
    it("should return null for empty lines", () => {
      expect(parseLine("", 1)).toBeNull();
      expect(parseLine("   ", 2)).toBeNull();
    });

    it("should parse iso-bracketed patterns", () => {
      const result = parseLine("2024-01-15T10:30:00Z [INFO] System started", 1);
      expect(result).not.toBeNull();
      expect(result?.level).toBe("INFO");
      expect(result?.message).toBe("System started");
      expect(result?.lineNumber).toBe(1);
      expect(result?.timestamp?.toISOString()).toBe("2024-01-15T10:30:00.000Z");
    });

    it("should parse syslog style patterns", () => {
      const result = parseLine("Jan 15 10:30:00 server process: A message occurred", 2);
      expect(result).not.toBeNull();
      // "A message occurred" -> No level -> detectLevelFromMessage returns "INFO"
      // parseLine uses INFO since it's a known level and the regex matched
      expect(result?.level).toBe("INFO");
      expect(result?.message).toBe("A message occurred");
    });

    it("should parse simple patterns (LEVEL: message)", () => {
      const result = parseLine("ERROR: Connection refused", 3);
      expect(result).not.toBeNull();
      expect(result?.level).toBe("ERROR");
      expect(result?.message).toBe("Connection refused");
      expect(result?.timestamp).toBeUndefined();
    });

    it("should parse bracketed patterns", () => {
      const result = parseLine("[DEBUG] Processing item", 4);
      expect(result).not.toBeNull();
      expect(result?.level).toBe("DEBUG");
      expect(result?.message).toBe("Processing item");
    });

    it("should fallback to keyword extraction if no pattern matches", () => {
      const result = parseLine("We got a FATAL issue here", 5);
      expect(result).not.toBeNull();
      expect(result?.level).toBe("FATAL");
      expect(result?.message).toBe("We got a FATAL issue here");
    });
  });
});
