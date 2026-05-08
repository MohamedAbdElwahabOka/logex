import type { LogEntry, FilterOptions } from "../types/index.js";

function buildFilterChain(
  options: FilterOptions,
): Array<(entry: LogEntry) => boolean> {
  const filters: Array<(entry: LogEntry) => boolean> = [];

  if (options.levels && options.levels.length > 0) {
    // Set for O(1) lookup instead of O(n) Array.includes()
    const upperLevels = new Set(options.levels.map((l) => l.toUpperCase()));
    filters.push((entry) => upperLevels.has(entry.level.toUpperCase()));
  }

  if (options.keyword) {
    const lower = options.keyword.toLowerCase();
    filters.push((entry) => entry.raw.toLowerCase().includes(lower));
  }

  if (options.regex) {
    const re = new RegExp(options.regex, "i");
    filters.push((entry) => re.test(entry.raw));
  }

  if (options.fromLine !== undefined) {
    filters.push((entry) => entry.lineNumber >= options.fromLine!);
  }

  if (options.toLine !== undefined) {
    filters.push((entry) => entry.lineNumber <= options.toLine!);
  }

  if (options.fromDate) {
    filters.push(
      (entry) => !!entry.timestamp && entry.timestamp >= options.fromDate!,
    );
  }

  if (options.toDate) {
    filters.push(
      (entry) => !!entry.timestamp && entry.timestamp <= options.toDate!,
    );
  }

  return filters;
}

export function filterEntries(
  entries: LogEntry[],
  options: FilterOptions,
): LogEntry[] {
  const filters = buildFilterChain(options);
  if (filters.length === 0) return entries;
  return entries.filter((entry) => filters.every((fn) => fn(entry)));
}

/**
 * Extract all unique log levels present in entries, sorted alphabetically.
 * Set naturally deduplicates.
 */
export function getUniqueLevels(entries: LogEntry[]): string[] {
  const levels = new Set<string>();
  for (const entry of entries) {
    levels.add(entry.level);
  }
  return [...levels].sort();
}

/**
 * Search entries by keyword with match position tracking.
 * matchIndex enables highlighting in future UIs.
 */
export function searchEntries(
  entries: LogEntry[],
  keyword: string,
): Array<LogEntry & { matchIndex: number }> {
  const lower = keyword.toLowerCase();
  return entries
    .filter((entry) => entry.raw.toLowerCase().includes(lower))
    .map((entry) => ({
      ...entry,
      matchIndex: entry.raw.toLowerCase().indexOf(lower),
    }));
}
