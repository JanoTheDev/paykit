import { readFileSync } from "node:fs";

export function renderTemplate(
  templatePath: string,
  variables: Record<string, string>,
): string {
  const raw = readFileSync(templatePath, "utf8");
  return raw.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (match, key) => {
    return Object.prototype.hasOwnProperty.call(variables, key)
      ? variables[key]
      : match;
  });
}
