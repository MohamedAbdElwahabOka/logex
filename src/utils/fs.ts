import * as fs from "node:fs";
import * as path from "node:path";

export function resolveFilePath(filePath: string): string {
  return path.resolve(process.cwd(), filePath);
}

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

export function getFileSize(filePath: string): string {
  const stats = fs.statSync(filePath);
  const bytes = stats.size;

  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(2);

  return `${size} ${units[i]}`;
}

export function getFileSizeBytes(filePath: string): number {
  return fs.statSync(filePath).size;
}

export function ensureDirectory(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
