import * as fs from "node:fs";
import * as readline from "node:readline";
import type { Readable } from "node:stream";
import type { LogEntry, LogLevel } from "../types/index.js";

const LOG_PATTERNS = [
  {
    name: "iso-bracketed",
    regex:
      /^(?<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)\s+\[(?<level>[A-Z]+)\]\s+(?<message>.+)$/i,
  },
  {
    name: "iso-spaced",
    regex:
      /^(?<timestamp>\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}(?:\.\d+)?)\s+(?<level>[A-Z]+)\s+(?<message>.+)$/i,
  },
  {
    name: "syslog",
    regex:
      /^(?<timestamp>[A-Z][a-z]{2}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+\S+\s+\S+:\s+(?<message>.+)$/i,
  },
  {
    name: "simple",
    regex: /^(?<level>[A-Z]+):\s+(?<message>.+)$/i,
  },
  {
    name: "bracketed",
    regex: /^\[(?<level>[A-Z]+)\]\s+(?<message>.+)$/i,
  },
];

/** Known severity levels Set not array for fast O(1) validation */
const KNOWN_LEVELS = new Set([
  "FATAL",
  "ERROR",
  "WARN",
  "WARNING",
  "INFO",
  "DEBUG",
  "TRACE",
  "SEVERE",
  "EXCEPTION",
  "FAIL",
]);

export function detectLevelFromMessage(message: string): LogLevel {
  const levels: Array<[LogLevel, RegExp]> = [
    ["FATAL", /\bFATAL\b/i],
    ["ERROR", /\bERROR\b/i],
    ["EXCEPTION", /\bEXCEPTION\b/i],
    ["FAIL", /\bFAIL\b/i],
    ["WARN", /\bWARN(?:ING)?\b/i],
    ["INFO", /\bINFO\b/i],
    ["DEBUG", /\bDEBUG\b/i],
    ["TRACE", /\bTRACE\b/i],
  ];

  for (const [level, regex] of levels) {
    if (regex.test(message)) return level;
  }

  return "INFO";
}

export function parseLine(raw: string, lineNumber: number): LogEntry | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  for (const pattern of LOG_PATTERNS) {
    const match = trimmed.match(pattern.regex);
    if (match?.groups) {
      const level = match.groups.level
        ? match.groups.level.toUpperCase()
        : detectLevelFromMessage(match.groups.message || trimmed);

      return {
        lineNumber,
        level: KNOWN_LEVELS.has(level)
          ? level
          : detectLevelFromMessage(trimmed),
        message: match.groups.message || trimmed,
        timestamp: match.groups.timestamp
          ? parseTimestamp(match.groups.timestamp)
          : undefined,
        raw: trimmed,
      };
    }
  }

  // No pattern matched — try keyword detection
  const detectedLevel = detectLevelFromMessage(trimmed);
  return {
    lineNumber,
    level: detectedLevel === "INFO" ? "UNKNOWN" : detectedLevel,
    message: trimmed,
    raw: trimmed,
  };
}

export function parseTimestamp(raw: string): Date | undefined {
  const d = new Date(raw);
  return isNaN(d.getTime()) ? undefined : d;
}

export async function parseLogStream(
  stream: Readable,
  onEntry?: (entry: LogEntry) => void,
): Promise<LogEntry[]> {
  const entries: LogEntry[] = [];
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  let lineNumber = 0;

  for await (const line of rl) {
    lineNumber++;
    const entry = parseLine(line, lineNumber);
    if (entry) {
      entries.push(entry);
      onEntry?.(entry);
    }
  }

  return entries;
}

export async function parseLogFile(
  filePath: string,
  onEntry?: (entry: LogEntry) => void,
): Promise<LogEntry[]> {
  const fileStream = fs.createReadStream(filePath);
  return parseLogStream(fileStream, onEntry);
}

export async function countLines(filePath: string): Promise<number> {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let count = 0;
  for await (const _line of rl) {
    count++;
  }

  return count;
}
