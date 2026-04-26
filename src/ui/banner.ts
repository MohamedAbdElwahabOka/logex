import figlet from "figlet";
import gradient from "gradient-string";
import boxen from "boxen";
import chalk from "chalk";

export function showBanner(): void {
  const ascii = figlet.textSync("logex", {
    font: "Standard",
    horizontalLayout: "default",
  });

  const colored = gradient(["#7C3AED", "#06B6D4", "#10B981"])(ascii);
  console.log(colored);

  const info = boxen(chalk.gray(`v1.0.0 • Log Analysis Toolkit`), {
    padding: { left: 1, right: 1, top: 0, bottom: 0 },
    borderStyle: "round",
    borderColor: "gray",
  });

  console.log(info);
  console.log();
}

export function showMiniHeader(): void {
  const title = gradient(["#7C3AED", "#06B6D4"])("logex");
  console.log(`\n  ${title} ${chalk.gray("v0.3.0")}\n`);
}
