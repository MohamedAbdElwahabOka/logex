import { Command } from "commander";
import { parseLogFile, countLines } from "../core/parser.js";
import { analyzeEntries } from "../core/analyzer.js";
import { resolveFilePath, fileExists } from "../utils/fs.js";
import { showMiniHeader } from "../ui/banner.js";
import { withSpinner } from "../ui/spinner.js";
import { renderAnalysisTable } from "../ui/table.js";

const program = new Command();

program
  .name("logex")
  .description(
    "A powerful CLI tool for parsing, filtering, and analyzing log files.",
  )
  .version("0.4.0");

function validateFileOrExit(filePath: string): void {
  if (!fileExists(filePath)) {
    console.error(`\n  Error: File not found — ${filePath}\n`);
    process.exit(1);
  }
}

program
  .command("analyze [file]")
  .alias("a")
  .description("Analyze log file statistics")
  .action(async (file: string | undefined) => {
    if (!file) {
      console.error("\n  Error: Please provide a log file path.\n");
      process.exit(1);
    }

    showMiniHeader();
    const resolved = resolveFilePath(file);
    validateFileOrExit(resolved);

    const entries = await withSpinner("Parsing log file…", () =>
      parseLogFile(resolved),
    );
    const totalLines = await countLines(resolved);
    const result = analyzeEntries(entries, resolved, totalLines);

    renderAnalysisTable(result);
  });

program.parse();
