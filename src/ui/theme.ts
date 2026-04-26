import chalk from "chalk";

export const theme = {
  // Semantic log level colors
  fatal: (text: string) => chalk.bgRed.white.bold(` ${text} `),
  error: (text: string) => chalk.red.bold(text),
  warn: (text: string) => chalk.yellow(text),
  info: (text: string) => chalk.blue(text),
  debug: (text: string) => chalk.gray(text),
  trace: (text: string) => chalk.dim(text),

  // UI chrome
  success: (text: string) => chalk.green.bold(text),
  highlight: (text: string) => chalk.cyan.bold(text),
  muted: (text: string) => chalk.gray(text),
  accent: (text: string) => chalk.hex("#7C3AED")(text),

  // Structured
  header: (text: string) => chalk.bold.underline(text),
  subheader: (text: string) => chalk.bold(text),
  label: (text: string) => chalk.cyan(text),
  separator: () => chalk.gray("─".repeat(50)),

  count: (n: number) => chalk.yellow.bold(n.toLocaleString()),
  percentage: (p: string) => chalk.cyan(`${p}%`),

  level(level: string): string {
    switch (level.toUpperCase()) {
      case "FATAL":
        return this.fatal(level);
      case "ERROR":
      case "EXCEPTION":
      case "FAIL":
        return this.error(level);
      case "WARN":
      case "WARNING":
        return this.warn(level);
      case "INFO":
        return this.info(level);
      case "DEBUG":
        return this.debug(level);
      case "TRACE":
        return this.trace(level);
      default:
        return chalk.white(level);
    }
  },

  progressBar(percentage: number, width = 20): string {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    return (
      chalk.hex("#7C3AED")("█".repeat(filled)) + chalk.gray("░".repeat(empty))
    );
  },
} as const;
