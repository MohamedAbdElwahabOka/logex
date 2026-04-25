import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileExists, getFileSize, ensureDirectory, getFileSizeBytes, resolveFilePath } from "../src/utils/fs.js";

const FIXTURES_DIR = path.resolve(__dirname, "fixtures");
const TEST_FILE = path.join(FIXTURES_DIR, "test_file_2.txt");

describe("File System Utilities", () => {
  beforeAll(() => {
    ensureDirectory(TEST_FILE);
    fs.writeFileSync(TEST_FILE, "Hello, world!");
  });

  afterAll(() => {
    if (fs.existsSync(TEST_FILE)) {
      fs.unlinkSync(TEST_FILE);
    }
  });

  describe("fileExists", () => {
    it("should return true for existing files", () => {
      expect(fileExists(TEST_FILE)).toBe(true);
    });

    it("should return false for non-existing files", () => {
      expect(fileExists(path.join(FIXTURES_DIR, "non-existing.txt"))).toBe(false);
    });
  });

  describe("getFileSize", () => {
    it("should return formatted size for a file", () => {
      const size = getFileSize(TEST_FILE);
      // "Hello, world!" is 13 bytes
      expect(size).toBe("13.00 B");
    });

    it("should return 0 B for an empty file", () => {
      const emptyFile = path.join(FIXTURES_DIR, "empty.txt");
      fs.writeFileSync(emptyFile, "");
      expect(getFileSize(emptyFile)).toBe("0 B");
      fs.unlinkSync(emptyFile);
    });
  });

  describe("getFileSizeBytes", () => {
    it("should return exact size in bytes", () => {
      expect(getFileSizeBytes(TEST_FILE)).toBe(13);
    });
  });

  describe("resolveFilePath", () => {
    it("should resolve relative paths based on cwd", () => {
      const relativePath = "tests/fixtures/test_file.txt";
      const resolved = resolveFilePath(relativePath);
      expect(resolved).toBe(path.resolve(process.cwd(), relativePath));
    });
  });

  describe("ensureDirectory", () => {
    it("should create directory if it does not exist", () => {
      const newDir = path.join(FIXTURES_DIR, "new_dir", "file.txt");
      ensureDirectory(newDir);
      expect(fs.existsSync(path.dirname(newDir))).toBe(true);
      // cleanup
      fs.rmSync(path.join(FIXTURES_DIR, "new_dir"), { recursive: true, force: true });
    });
  });
});
