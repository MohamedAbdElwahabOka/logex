export type LogLevel =
  | "FATAL"
  | "ERROR"
  | "WARN"
  | "INFO"
  | "DEBUG"
  | "TRACE"
  | "UNKNOWN"
  | (string & {});

export interface LogEntry {
  lineNumber: number;
  level: LogLevel;
  message: string;
  timestamp?: Date;
  raw: string;
}

export interface AnalysisResult {
  totalEntries: number;
  totalLines: number;
  levelCounts: Record<string, number>;
  levelPercentages: Record<string, string>;
  topMessages: Array<{ message: string; count: number }>;
  earliestTimestamp?: Date;
  latestTimestamp?: Date;
  filePath: string | null;
  fileSize: string | null;
}

export interface FilterOptions {
  levels?: string[];
  keyword?: string;
  regex?: string;
  fromLine?: number;
  toLine?: number;
  fromDate?: Date;
  toDate?: Date;
}

export type ExportFormat = "log";

export interface ExportOptions {
  format: ExportFormat;
  outputPath: string;
  includeLineNumbers?: boolean;
}

export const LOG_LEVEL_PRIORITY: Record<string, number> = {
  FATAL: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4,
  TRACE: 5,
  UNKNOWN: 6,
};

export function normalizeLevel(level: string): string {
  const aliases: Record<string, string> = {
    WARNING: "WARN",
    EXCEPTION: "ERROR",
    SEVERE: "ERROR",
    FAIL: "ERROR",
    FAILURE: "ERROR",
    CRITICAL: "FATAL",
  };
  return aliases[level.toUpperCase()] ?? level.toUpperCase();
}
