import { parseLogFile, countLines } from "../core/parser.js";
import { resolveFilePath, fileExists, getFileSize } from "../utils/fs.js";

async function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.log("Usage: logex <file>");
    console.log("Example: logex ./app.log");
    process.exit(1);
  }

  const resolved = resolveFilePath(filePath);

  if (!fileExists(resolved)) {
    console.error(`Error: File not found: ${resolved}`);
    process.exit(1);
  }

  console.log(`\nParsing: ${resolved}`);
  console.log(`Size: ${getFileSize(resolved)} bytes\n`);

  // دلوقتي الـ await جوه دالة async فمش هتعمل أي مشاكل
  const entries = await parseLogFile(resolved);
  const totalLines = await countLines(resolved);

  console.log(`Total lines: ${totalLines}`);
  console.log(`Parsed entries: ${entries.length}`);

  console.log(`\nFirst 5 entries:`);
  entries.slice(0, 5).forEach((e) => {
    console.log(`  Line ${e.lineNumber}: [${e.level}] ${e.message}`);
  });
}

// تشغيل الدالة مع اصطياد أي أخطاء غير متوقعة
main().catch((error) => {
  console.error("An unexpected error occurred:", error);
  process.exit(1);
});
