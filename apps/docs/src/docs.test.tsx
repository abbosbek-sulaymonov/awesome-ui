import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "./App";
import { examples } from "./examples";
import { pages } from "./pages";

/**
 * Smoke tests for the docs site.
 *
 * A component page that throws is invisible until someone opens it, and the
 * examples are real code that can break when a component's API changes. This
 * renders every page and every example so a break shows up in CI instead of in
 * front of a reader.
 */

afterEach(() => {
  window.location.hash = "";
});

describe("docs pages", () => {
  it.each(pages.map((page) => [page.slug || "(index)", page.slug, page.title]))(
    "renders %s without throwing",
    (_label, slug, title) => {
      window.location.hash = `/${slug}`;
      render(<App />);

      expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
    },
  );

  it("shows a not-found page for an unknown route", () => {
    window.location.hash = "/does-not-exist";
    render(<App />);

    expect(screen.getByRole("heading", { level: 1, name: "Not found" })).toBeInTheDocument();
  });

  it("gives every component page at least one example", () => {
    const componentPages = pages.filter((page) => page.propsFile);
    const withoutExamples = componentPages.filter(
      (page) => !examples.some((example) => example.component === page.slug),
    );

    expect(withoutExamples.map((page) => page.slug)).toEqual([]);
  });
});

describe("docs examples", () => {
  it.each(examples.map((example) => [example.id, example]))(
    "renders %s without throwing",
    (_id, example) => {
      const { container } = render(<example.Component />);
      expect(container).toBeTruthy();
    },
  );

  it("carries the real source for every example", () => {
    for (const example of examples) {
      // The preview and the code block come from the same file; an empty
      // source means the ?raw glob stopped matching.
      expect(example.source.length).toBeGreaterThan(0);
      expect(example.source).toContain("export default");
    }
  });
});
