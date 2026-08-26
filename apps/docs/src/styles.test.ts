import { describe, expect, it } from "vitest";
// Read through Vite rather than the filesystem: under the test transform
// `import.meta.url` is not a file: URL, and this is the same stylesheet the
// app itself loads.
import css from "./docs.css?raw";

/**
 * Static checks on the docs stylesheet.
 *
 * jsdom does not resolve cascade or descendant selectors well enough to assert
 * this by rendering, and the bug being guarded here was plainly visible on
 * screen while every render test stayed green: `.prose code` also matched the
 * <code> inside a <pre>, and an inline element spanning many lines paints its
 * background and border once per line fragment — so every line of a code block
 * got its own box.
 */

interface Rule {
  selectors: string[];
  body: string;
}

function parseRules(source: string): Rule[] {
  const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const rules: Rule[] = [];

  for (const match of withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = match[1]!.trim();
    // Skip at-rule preludes such as `@media (...)`, which carry no declarations.
    if (selector.startsWith("@")) continue;

    rules.push({
      selectors: selector.split(",").map((entry) => entry.trim()),
      body: match[2]!,
    });
  }

  return rules;
}

const rules = parseRules(css);

/** Selectors that would match a <code> nested inside a <pre>. */
function matchesCodeInsidePre(selector: string): boolean {
  if (!/\bcode\s*$/.test(selector)) return false;
  // Explicitly scoped away from pre.
  if (selector.includes(":not(pre)")) return false;
  // Deliberately targets the block's own code element.
  if (selector.includes(".codeBlock")) return false;
  return true;
}

describe("docs.css", () => {
  it("never gives a boxed appearance to code inside a pre", () => {
    const offenders = rules
      .filter((rule) => rule.selectors.some(matchesCodeInsidePre))
      .filter((rule) => /(^|\s|;)(background|border)/.test(rule.body))
      .flatMap((rule) => rule.selectors);

    expect(offenders).toEqual([]);
  });

  it("resets the code element inside a code block", () => {
    const rule = rules.find((entry) => entry.selectors.includes(".codeBlock code"));

    expect(rule).toBeDefined();
    // Whatever an ancestor tries to impose, this stays a transparent span.
    expect(rule!.body).toMatch(/border:\s*0/);
    expect(rule!.body).toMatch(/background:\s*none/);
  });

  it("still styles inline code in prose", () => {
    const rule = rules.find((entry) => entry.selectors.includes(".prose :not(pre) > code"));

    expect(rule).toBeDefined();
    expect(rule!.body).toMatch(/background-color/);
  });

  it("gives a standalone code block its own outer border", () => {
    const rule = rules.find((entry) => entry.selectors.includes(".prose > .codeBlock"));

    expect(rule).toBeDefined();
    expect(rule!.body).toMatch(/border:/);
  });
});
