import { describe, it, expect } from "vitest";
import { renderTemplate } from "../render";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("renderTemplate", () => {
  const dir = mkdtempSync(join(tmpdir(), "mailer-"));

  it("substitutes single variable", () => {
    const file = join(dir, "one.html");
    writeFileSync(file, "<p>Hi {{name}}</p>");
    expect(renderTemplate(file, { name: "Ada" })).toBe("<p>Hi Ada</p>");
  });

  it("substitutes multiple variables", () => {
    const file = join(dir, "two.html");
    writeFileSync(file, "<a href=\"{{url}}\">{{label}}</a>");
    expect(renderTemplate(file, { url: "https://x", label: "Go" })).toBe(
      '<a href="https://x">Go</a>',
    );
  });

  it("leaves unknown placeholders as-is", () => {
    const file = join(dir, "unknown.html");
    writeFileSync(file, "Hi {{name}}, {{missing}}");
    expect(renderTemplate(file, { name: "Ada" })).toBe("Hi Ada, {{missing}}");
  });

  it("escapes regex special chars in keys safely", () => {
    const file = join(dir, "safe.html");
    writeFileSync(file, "{{a.b}} {{name}}");
    expect(renderTemplate(file, { "a.b": "X", name: "Y" })).toBe("X Y");
  });
});
