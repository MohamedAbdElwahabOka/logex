import Table from "cli-table3";
import chalk from "chalk";
import { theme } from "./theme.js";
import { severitySummary, sortBySeverity } from "../core/analyzer.js";
import type { AnalysisResult, LogEntry } from "../types/index.js";

/**
 * Render a full multi-section analysis dashboard:
 * Overview → Severity → Level Distribution → Top Messages
 */
export function renderAnalysisTable(result: AnalysisResult): void {
  // --- Overview ---
  console.log(`\n  ${theme.header("📊 Analysis Overview")}\n`);

  const overviewTable = new Table({
    chars: { mid: "", "left-mid": "", "mid-mid": "", "right-mid": "" },
    style: { "padding-left": 2 },
  });

  overviewTable.push(
    [theme.label("Total Lines"), theme.count(result.totalLines)],
    [theme.label("Parsed Entries"), theme.count(result.totalEntries)],
    [
      theme.label("Unparsed Lines"),
      theme.count(result.totalLines - result.totalEntries),
    ],
  );

  if (result.fileSize) {
    overviewTable.push([
      theme.label("File Size"),
      theme.accent(result.fileSize),
    ]);
  }

  if (result.earliestTimestamp && result.latestTimestamp) {
    overviewTable.push(
      [
        theme.label("Time Range Start"),
        theme.muted(result.earliestTimestamp.toISOString()),
      ],
      [
        theme.label("Time Range End"),
        theme.muted(result.latestTimestamp.toISOString()),
      ],
    );
  }

  console.log(overviewTable.toString());

  // --- Severity ---
  const severity = severitySummary(result);
  console.log(`\n  ${theme.header("🔴 Severity Breakdown")}\n`);

  const sevTable = new Table({
    chars: { mid: "", "left-mid": "", "mid-mid": "", "right-mid": "" },
    style: { "padding-left": 2 },
  });

  sevTable.push(
    [theme.error("Critical"), theme.count(severity.critical)],
    [theme.warn("Warnings"), theme.count(severity.warnings)],
    [theme.info("Informational"), theme.count(severity.informational)],
  );

  console.log(sevTable.toString());

  // --- Level Distribution ---
  console.log(`\n  ${theme.header("📈 Level Distribution")}\n`);

  const sorted = sortBySeverity(result.levelCounts);
  const levelTable = new Table({
    head: [
      chalk.cyan("Level"),
      chalk.cyan("Count"),
      chalk.cyan("%"),
      chalk.cyan("Distribution"),
    ],
    style: { "padding-left": 2, head: [] },
  });

  for (const [level, count] of sorted) {
    const pct = result.levelPercentages[level];
    levelTable.push([
      theme.level(level),
      theme.count(count),
      theme.percentage(pct),
      theme.progressBar(parseFloat(pct)),
    ]);
  }

  console.log(levelTable.toString());

  // --- Top Messages ---
  if (result.topMessages.length > 0) {
    console.log(`\n  ${theme.header("🔥 Top Messages")}\n`);

    const msgTable = new Table({
      head: [chalk.cyan("#"), chalk.cyan("Count"), chalk.cyan("Message")],
      colWidths: [5, 8, 60],
      style: { "padding-left": 2, head: [] },
      wordWrap: true,
    });

    result.topMessages.forEach((m, i) => {
      const msg =
        m.message.length > 55 ? m.message.substring(0, 55) + "…" : m.message;
      msgTable.push([chalk.gray(`${i + 1}`), theme.count(m.count), msg]);
    });

    console.log(msgTable.toString());
  }
}

/**
 * Render filtered entries in a paginated table.
 */
export function renderFilteredTable(
  entries: LogEntry[],
  maxRows: number = 50,
): void {
  if (entries.length === 0) {
    console.log(chalk.yellow("\n  ⚠ No entries matched your filters.\n"));
    return;
  }

  const showing = entries.slice(0, maxRows);

  const table = new Table({
    head: [chalk.cyan("Line"), chalk.cyan("Level"), chalk.cyan("Message")],
    colWidths: [8, 10, 60],
    style: { "padding-left": 2, head: [] },
    wordWrap: true,
  });

  for (const entry of showing) {
    const msg =
      entry.message.length > 55
        ? entry.message.substring(0, 55) + "…"
        : entry.message;
    table.push([
      chalk.gray(`${entry.lineNumber}`),
      theme.level(entry.level),
      msg,
    ]);
  }

  console.log(
    `\n  ${theme.header("🔍 Filtered Results")} ${theme.muted(`(${entries.length} entries)`)}\n`,
  );
  console.log(table.toString());

  if (entries.length > maxRows) {
    console.log(
      chalk.gray(
        `\n  ... and ${entries.length - maxRows} more entries. Use --output to export all.\n`,
      ),
    );
  }
}

/**
 * Compact one-line summary of all levels with counts.
 */
export function renderCompactSummary(result: AnalysisResult): void {
  const sorted = sortBySeverity(result.levelCounts);
  const summary = sorted
    .map(([level, count]) => `${theme.level(level)}: ${theme.count(count)}`)
    .join("  •  ");
  console.log(`\n  ${summary}\n`);
}
