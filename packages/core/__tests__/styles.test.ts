import { describe, expect, it } from "vitest";

/**
 * Static checks on the component stylesheets.
 *
 * These cover failures that are plainly visible on screen but invisible to
 * every rendering test: jsdom runs no animations, so an exit animation can be
 * completely wrong and the whole suite still passes.
 */

const sheets = import.meta.glob("../src/components/**/*.module.css", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

interface Rule {
  file: string;
  selector: string;
  body: string;
}

function rulesIn(source: string, file: string): Rule[] {
  const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const rules: Rule[] = [];

  for (const match of withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = match[1]!.trim();
    // Skip at-rule preludes such as `@layer` and `@media`, which carry no
    // declarations of their own.
    if (selector.startsWith("@")) continue;
    rules.push({ file, selector, body: match[2]! });
  }

  return rules;
}

const allRules = Object.entries(sheets).flatMap(([path, source]) =>
  rulesIn(source, path.split("/").pop()!),
);

describe("exit animations", () => {
  /**
   * Every exit animation must hold its final frame.
   *
   * The default fill mode is `none`, so the element snaps back to its base
   * style the instant the animation ends — fully opaque again — and stays that
   * way for the frame or two before the animationend handler unmounts it. That
   * snap-back reads as the panel flashing back into view as it closes.
   */
  it("hold their final frame until the node is unmounted", () => {
    const offenders = allRules
      .filter((rule) => rule.selector.includes('[data-state="closed"]'))
      .filter((rule) => /animation\s*:/.test(rule.body))
      .filter((rule) => !/\bforwards\b|\bboth\b/.test(rule.body))
      .map((rule) => `${rule.file} ${rule.selector.trim()}`);

    expect(offenders).toEqual([]);
  });

  it("exist at all for the components that animate in", () => {
    // An entrance without a matching exit means the panel vanishes instantly
    // while everything around it animates.
    const opens = new Set(
      allRules
        .filter((r) => r.selector.includes('[data-state="open"]') && /animation\s*:/.test(r.body))
        .map((r) => r.file),
    );
    const closes = new Set(
      allRules
        .filter((r) => r.selector.includes('[data-state="closed"]') && /animation\s*:/.test(r.body))
        .map((r) => r.file),
    );

    expect([...opens].filter((file) => !closes.has(file))).toEqual([]);
  });
});
