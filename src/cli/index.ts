import { parseLine } from "../core/parser.js";

// Quick test: parse a few hardcoded lines
const testLines = [
  "2024-01-15 10:30:00 ERROR Connection refused to database",
  "[WARN] High memory usage",
  "DEBUG: Entering function processRequest()",
];

console.log("logex parser — proof of concept\n");

testLines.forEach((line, i) => {
  const result = parseLine(line, i + 1);
  if (result) {
    console.log(
      `Line ${result.lineNumber}: [${result.level}] ${result.message}`,
    );
  }
});
