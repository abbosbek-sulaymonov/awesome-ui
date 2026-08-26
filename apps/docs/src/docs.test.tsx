import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  window.localStorage.clear();
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

describe("docs shell", () => {
  it("renders a topbar with the theme toggle in it", () => {
    render(<App />);
    const topbar = screen.getByRole("banner");

    expect(topbar).toBeInTheDocument();
    // The label names the outcome of pressing, not the current state — that is
    // what a screen-reader user needs before they press.
    expect(
      within(topbar).getByRole("button", { name: /Switch to (dark|light) mode/ }),
    ).toBeInTheDocument();
  });

  it("collapses and expands the sidebar", async () => {
    const { container } = render(<App />);
    const shell = container.querySelector(".shell")!;
    const toggle = screen.getByRole("button", { name: /(Collapse|Expand) sidebar/ });

    expect(shell).toHaveAttribute("data-sidebar", "open");
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(toggle);

    expect(shell).toHaveAttribute("data-sidebar", "collapsed");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("remembers the collapsed sidebar across mounts", async () => {
    const first = render(<App />);
    await userEvent.click(screen.getByRole("button", { name: /Collapse sidebar/ }));
    first.unmount();

    const { container } = render(<App />);
    expect(container.querySelector(".shell")).toHaveAttribute("data-sidebar", "collapsed");
  });

  it("points the sidebar toggle at the sidebar it controls", () => {
    render(<App />);
    const toggle = screen.getByRole("button", { name: /(Collapse|Expand) sidebar/ });
    const sidebar = screen.getByRole("navigation", { name: "Documentation" });

    expect(toggle).toHaveAttribute("aria-controls", sidebar.id);
  });

  it("marks the current page in the sidebar", () => {
    window.location.hash = "/button";
    render(<App />);

    const current = screen.getByRole("link", { current: "page" });
    expect(current).toHaveTextContent("Button");
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
