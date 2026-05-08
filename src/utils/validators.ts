import { fileExists } from "./fs.js";

export function validateFilePath(filepath: string): string | null {
  if (!filepath || filepath.trim() === "") {
    return "File path cannot be empty";
  }
  if (!fileExists(filepath)) {
    return `file not found : ${filepath}`;
  }
  return null;
}

export function validateRegex(pattern: string): string | null {
  try {
    new RegExp(pattern);
    return null;
  } catch {
    return `Invalid regex pattern: ${pattern}`;
  }
}

export function validateLineRange(start: number, end: number): string | null {
  if (!Number.isInteger(start) || start < 1)
    return "Start line must be a positive integer";
  if (!Number.isInteger(end) || end < 1)
    return "End line must be a positive integer";
  if (start > end) return "Start line cannot be greater than end line";
  return null;
}

export function parseLevelList(input: string): string[] {
  return input
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter((s) => s.length > 0);
}
