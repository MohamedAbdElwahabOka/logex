import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { parseLogStream, parseLogFile } from "../src/core/parser.js";
import { ensureDirectory } from "../src/utils/fs.js";

const FIXTURES_DIR = path.resolve(__dirname, "fixtures");
const LARGE_LOG_FILE = path.join(FIXTURES_DIR, "large.log");
const SMALL_LOG_FILE = path.join(FIXTURES_DIR, "small.log");

const NUM_LINES_LARGE = 100000;
const NUM_LINES_SMALL = 100;

function generateLogFile(filePath: string, numLines: number) {
  ensureDirectory(filePath);
  const stream = fs.createWriteStream(filePath);
  for (let i = 1; i <= numLines; i++) {
    const level = i % 10 === 0 ? "ERROR" : "INFO";
    stream.write(`2024-01-15T10:30:00Z [${level}] This is log line ${i}\n`);
  }
  stream.end();
  return new Promise((resolve) => stream.on("finish", resolve));
}

describe("Streaming Parser", () => {
  beforeAll(async () => {
    await generateLogFile(SMALL_LOG_FILE, NUM_LINES_SMALL);
    await generateLogFile(LARGE_LOG_FILE, NUM_LINES_LARGE);
  });

  afterAll(() => {
    if (fs.existsSync(SMALL_LOG_FILE)) fs.unlinkSync(SMALL_LOG_FILE);
    if (fs.existsSync(LARGE_LOG_FILE)) fs.unlinkSync(LARGE_LOG_FILE);
  });

  it("should parse a small log file correctly", async () => {
    const entries = await parseLogFile(SMALL_LOG_FILE);
    expect(entries.length).toBe(NUM_LINES_SMALL);
    expect(entries[0]?.level).toBe("INFO");
    expect(entries[9]?.level).toBe("ERROR"); // 10th line (1-indexed) is ERROR
  });

  it("should support onEntry callback", async () => {
    let errorCount = 0;
    const entries = await parseLogFile(SMALL_LOG_FILE, (entry) => {
      if (entry.level === "ERROR") {
        errorCount++;
      }
    });
    expect(entries.length).toBe(NUM_LINES_SMALL);
    expect(errorCount).toBe(10); // 100 / 10
  });

  it("should process large files and maintain memory stability", async () => {
    // Force garbage collection if exposed (needs --expose-gc flag, usually not available by default in vitest)
    // We will measure memory before and after. 
    // Since parseLogFile currently accumulates all entries in an array, memory WILL grow.
    // We will test the memory used per entry.
    const initialMemory = process.memoryUsage().heapUsed;
    
    let processedCount = 0;
    const entries = await parseLogFile(LARGE_LOG_FILE, () => {
      processedCount++;
    });

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncreaseMB = (finalMemory - initialMemory) / 1024 / 1024;
    
    expect(processedCount).toBe(NUM_LINES_LARGE);
    expect(entries.length).toBe(NUM_LINES_LARGE);

    // If it accumulates 100,000 objects, it might take 20-50MB. We ensure it doesn't take gigabytes.
    // A more memory-efficient approach would be to NOT accumulate when not requested.
    console.log(`Memory increase for 100k lines: ${memoryIncreaseMB.toFixed(2)} MB`);
    expect(memoryIncreaseMB).toBeLessThan(100); // 100MB is a safe upper bound for 100k simple objects
  });
});
