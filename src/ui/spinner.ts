import ora, { type Ora } from "ora";

export function createSpinner(text: string): Ora {
  return ora({ text, color: "magenta", spinner: "dots2" }).start();
}

export async function withSpinner<T>(
  text: string,
  operation: () => Promise<T>,
  successText?: string,
): Promise<T> {
  const spinner = createSpinner(text);
  try {
    const result = await operation();
    spinner.succeed(successText || text);
    return result;
  } catch (error) {
    spinner.fail(`Failed: ${text}`);
    throw error;
  }
}
