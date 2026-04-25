import { Command } from "commander";
import { parseLogFile, countLines } from "../core/parser.js";
import {
  analyzeEntries,
  severitySummary,
  sortBySeverity,
} from "../core/analyzer.js";
import { resolveFilePath, fileExists, getFileSize } from "../utils/fs.js";

const program = new Command();

program
  .name("logex")
  .description(
    "A powerful CLI tool for parsing, filtering, and analyzing log files.",
  )
  .version("0.3.0");

// --- Helper ---
function validateFileOrExit(filePath: string): void {
  if (!fileExists(filePath)) {
    console.error(`\n  Error: File not found — ${filePath}\n`);
    process.exit(1);
  }
}

// --- Analyze Command ---
program
  .command("analyze [file]")
  .alias("a")
  .description("Analyze log file statistics")
  .action(async (file: string | undefined) => {
    if (!file) {
      console.error("\n  Error: Please provide a log file path.\n");
      process.exit(1);
    }

    const resolved = resolveFilePath(file);
    validateFileOrExit(resolved);

    console.log(`\nAnalyzing: ${resolved}`);
    console.log(`File size: ${getFileSize(resolved)}\n`);

    const entries = await parseLogFile(resolved);
    const totalLines = await countLines(resolved);
    const result = analyzeEntries(entries, resolved, totalLines);
    const severity = severitySummary(result);

    // Basic text output (will be beautiful tables in Milestone 5)
    console.log(`--- Analysis Results ---`);
    console.log(`Total lines: ${result.totalLines}`);
    console.log(`Parsed entries: ${result.totalEntries}`);
    console.log(`\n--- Severity ---`);
    console.log(`Critical: ${severity.critical}`);
    console.log(`Warnings: ${severity.warnings}`);
    console.log(`Informational: ${severity.informational}`);
    console.log(`\n--- Level Distribution ---`);
    for (const [level, count] of sortBySeverity(result.levelCounts)) {
      console.log(`  ${level}: ${count} (${result.levelPercentages[level]}%)`);
    }
    console.log(`\n--- Top Messages ---`);
    result.topMessages.slice(0, 5).forEach((m, i) => {
      console.log(`  ${i + 1}. (${m.count}x) ${m.message}`);
    });
  });

program.parse();
