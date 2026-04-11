import { readFileSync } from "node:fs";

export function renderString(
  template: string,
  variables: Record<string, string>,
): string {
  return template.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (match, key) => {
    return Object.prototype.hasOwnProperty.call(variables, key)
      ? variables[key]
      : match;
  });
}

export function renderTemplate(
  templatePath: string,
  variables: Record<string, string>,
): string {
  return renderString(readFileSync(templatePath, "utf8"), variables);
}
