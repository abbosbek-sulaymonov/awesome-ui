import { describe, expect, it } from "vitest";
// Read through Vite rather than the filesystem: under the test transform
// `import.meta.url` is not a file: URL, and this is the same stylesheet the
// app itself loads.
import css from "../src/docs.css?raw";

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

  it("never paints a focus ring onto a library component", () => {
    // Library rules live in `@layer aui.components`; this stylesheet is
    // unlayered, and unlayered declarations beat layered ones regardless of
    // specificity. An unscoped `:focus-visible` here therefore overrides the
    // `outline: none` that Input sets on its own <input> — which draws a second
    // ring inside the one the component already draws on its wrapper.
    const offenders = rules
      .filter((rule) => rule.selectors.some((selector) => selector.includes(":focus-visible")))
      .filter((rule) => /outline\s*:/.test(rule.body))
      .filter((rule) =>
        rule.selectors.some((selector) => {
          const scopedOut = selector.includes(':not([class*="aui-"])');
          // A selector naming a docs class cannot reach a library element.
          const docsScoped = /\.(iconButton|navLink|brand|codeBlock|scrim|example|sidebar|topbar)/.test(
            selector,
          );
          return !scopedOut && !docsScoped;
        }),
      )
      .flatMap((rule) => rule.selectors);

    expect(offenders).toEqual([]);
  });

  it("gives a standalone code block its own outer border", () => {
    const rule = rules.find((entry) => entry.selectors.includes(".prose > .codeBlock"));

    expect(rule).toBeDefined();
    expect(rule!.body).toMatch(/border:/);
  });
});

/**
 * Contrast of the navigation states.
 *
 * The sidebar's hover was `oklch(99%)` on a `97.5%` page — 1.5% of lightness
 * apart, and *lighter* than the page it sat on. In a light theme a hover has to
 * go down, not up, and there is no headroom above a near-white background. The
 * numbers are in the stylesheet, so this is measurable rather than a matter of
 * opinion.
 */
function lightnessIn(block: string, variable: string): number {
  const match = new RegExp(`${variable}\\s*:\\s*oklch\\(\\s*([\\d.]+)%`).exec(block);
  if (!match) throw new Error(`${variable} not found, or not an oklch literal`);
  return Number.parseFloat(match[1]!);
}

function blockFor(selector: string): string {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`no ${selector} block`);
  const open = css.indexOf("{", start);
  return css.slice(open, css.indexOf("\n}", open));
}

const MIN_SEPARATION = 2.5;

describe("navigation state contrast", () => {
  it("separates hover from the page background in light mode, downwards", () => {
    const light = blockFor(":root {");
    const page = lightnessIn(light, "--docs-bg");
    const hover = lightnessIn(light, "--docs-nav-hover-bg");

    expect(page - hover).toBeGreaterThanOrEqual(MIN_SEPARATION);
  });

  it("separates the active state from the page background in light mode", () => {
    const light = blockFor(":root {");
    const page = lightnessIn(light, "--docs-bg");
    const active = lightnessIn(light, "--docs-nav-active-bg");

    expect(page - active).toBeGreaterThanOrEqual(MIN_SEPARATION);
  });

  it("separates hover from the page background in dark mode, upwards", () => {
    const dark = blockFor(':root[data-theme="dark"] {');
    const page = lightnessIn(dark, "--docs-bg");
    const hover = lightnessIn(dark, "--docs-nav-hover-bg");

    expect(hover - page).toBeGreaterThanOrEqual(MIN_SEPARATION);
  });

  it("keeps the generic hover surface on the correct side of the page", () => {
    // `--docs-raised` is used for icon-button hovers and had the same defect.
    const light = blockFor(":root {");
    const dark = blockFor(':root[data-theme="dark"] {');

    expect(lightnessIn(light, "--docs-bg") - lightnessIn(light, "--docs-raised"))
      .toBeGreaterThanOrEqual(MIN_SEPARATION);
    expect(lightnessIn(dark, "--docs-raised") - lightnessIn(dark, "--docs-bg"))
      .toBeGreaterThanOrEqual(MIN_SEPARATION);
  });

  it("marks the active link with more than colour alone", () => {
    // Colour alone is a weak signal, and forced-colours modes discard it.
    expect(css).toMatch(/\.navLink\[aria-current="page"\]::before/);
  });
});
