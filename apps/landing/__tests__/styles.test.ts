import { describe, expect, it } from "vitest";
// Read through Vite rather than the filesystem: this is the same stylesheet the
// app itself loads.
import css from "../src/landing.css?raw";

interface Rule {
  selectors: string[];
  body: string;
}

function parseRules(source: string): Rule[] {
  const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const rules: Rule[] = [];

  for (const match of withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = match[1]!.trim();
    if (selector.startsWith("@")) continue;
    rules.push({
      selectors: selector.split(",").map((entry) => entry.trim()),
      body: match[2]!,
    });
  }

  return rules;
}

const rules = parseRules(css);

/**
 * Bare element selectors that could reach a library component.
 *
 * This is the third bug of exactly this shape: an unlayered rule in an app
 * stylesheet overriding a layered rule in the library. Layer precedence beats
 * specificity, so `a { color }` here outranks `.solid { color }` inside
 * `@layer aui.components` — which painted the anchor in
 * `<Button asChild><a>…</a></Button>` accent-on-accent and left an apparently
 * empty blue rectangle.
 *
 * The earlier two were a `:focus-visible` rule that double-ringed Input, and a
 * `.prose code` rule that boxed every line of a code block. Checking the class
 * rather than each instance is the only way this stops recurring.
 */
const REACHABLE_ELEMENTS = new Set([
  "a", "button", "input", "select", "textarea", "label", "fieldset", "legend",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
  "ul", "ol", "li", "p", "pre", "code", "figure",
  "h1", "h2", "h3", "h4", "h5", "h6",
]);

const VISUAL_PROPERTY = /(^|;|\s)(color|background|background-color|border|outline|padding|margin|font)\s*:/;

describe("app styles do not reach into library components", () => {
  it("has no bare element selector that could repaint a component", () => {
    const offenders = rules
      .filter((rule) => VISUAL_PROPERTY.test(rule.body))
      .flatMap((rule) => rule.selectors)
      .filter((selector) => REACHABLE_ELEMENTS.has(selector.trim()));

    expect(offenders).toEqual([]);
  });
});
