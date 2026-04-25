import type { LogEntry, AnalysisResult } from "../types/index.js";
import { LOG_LEVEL_PRIORITY, normalizeLevel } from "../types/index.js";
import { getFileSize } from "../utils/fs.js";

export function analyzeEntries(
  entries: LogEntry[],
  filePath: string | null,
  totalLines: number,
): AnalysisResult {
  const levelCounts: Record<string, number> = {};
  const messageCounts: Record<string, number> = {};
  let earliestTimestamp: Date | undefined;
  let latestTimestamp: Date | undefined;

  for (const entry of entries) {
    // Level counting
    levelCounts[entry.level] = (levelCounts[entry.level] || 0) + 1;

    const msgKey = entry.message.toLowerCase().trim();
    messageCounts[msgKey] = (messageCounts[msgKey] || 0) + 1;

    // Time range tracking
    if (entry.timestamp) {
      if (!earliestTimestamp || entry.timestamp < earliestTimestamp) {
        earliestTimestamp = entry.timestamp;
      }
      if (!latestTimestamp || entry.timestamp > latestTimestamp) {
        latestTimestamp = entry.timestamp;
      }
    }
  }

  const levelPercentages: Record<string, string> = {};
  for (const [level, count] of Object.entries(levelCounts)) {
    levelPercentages[level] = ((count / entries.length) * 100).toFixed(1);
  }

  const topMessages = Object.entries(messageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([message, count]) => ({ message, count }));

  return {
    totalEntries: entries.length,
    totalLines,
    levelCounts,
    levelPercentages,
    topMessages,
    earliestTimestamp,
    latestTimestamp,
    filePath,
    fileSize: filePath ? getFileSize(filePath) : null,
  };
}

export function severitySummary(result: AnalysisResult): {
  critical: number;
  warnings: number;
  informational: number;
} {
  let critical = 0;
  let warnings = 0;
  let informational = 0;

  for (const [level, count] of Object.entries(result.levelCounts)) {
    const normalized = normalizeLevel(level);
    const priority = LOG_LEVEL_PRIORITY[normalized] ?? 6;

    if (priority <= 1) critical += count;
    else if (priority === 2) warnings += count;
    else informational += count;
  }

  return { critical, warnings, informational };
}

export function sortBySeverity(
  levelCounts: Record<string, number>,
): [string, number][] {
  return Object.entries(levelCounts).sort((a, b) => {
    const priorityA = LOG_LEVEL_PRIORITY[a[0]] ?? 99;
    const priorityB = LOG_LEVEL_PRIORITY[b[0]] ?? 99;
    return priorityA - priorityB;
  });
}
