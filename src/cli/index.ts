import { Command } from "commander";
import { parseLogFile, countLines } from "../core/parser.js";
import { analyzeEntries } from "../core/analyzer.js";
import { resolveFilePath, fileExists } from "../utils/fs.js";
import { showMiniHeader } from "../ui/banner.js";
import { withSpinner } from "../ui/spinner.js";
import { renderAnalysisTable } from "../ui/table.js";
import { filterEntries } from "../core/filter.js";
import { parseLevelList } from "../utils/validators.js";
import { renderFilteredTable } from "../ui/table.js";

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

program
  .command("filter [file]")
  .alias("f")
  .description("Filter log entries by criteria")
  .option(
    "-l, --level <levels>",
    "Comma-separated log levels (e.g. ERROR,WARN)",
  )
  .option("-k, --keyword <word>", "Case-insensitive keyword search")
  .option("-r, --regex <pattern>", "Regex pattern to match")
  .option("--from <line>", "Start line number", parseInt)
  .option("--to <line>", "End line number", parseInt)
  .option("-o, --output <path>", "Output file path (saves instead of printing)")
  .action(async (file: string | undefined, options: any) => {
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

    const filterOptions: any = {};
    if (options.level) filterOptions.levels = parseLevelList(options.level);
    if (options.keyword) filterOptions.keyword = options.keyword;
    if (options.regex) filterOptions.regex = options.regex;
    if (options.from) filterOptions.fromLine = options.from;
    if (options.to) filterOptions.toLine = options.to;

    const filtered = filterEntries(entries, filterOptions);
    renderFilteredTable(filtered);
  });

program.parse();
