import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../src/App";
import { features, principles, stats } from "../src/content";

describe("landing page", () => {
  it("renders one top-level heading", () => {
    render(<App />);
    const h1 = screen.getAllByRole("heading", { level: 1 });

    // More than one h1 leaves a screen-reader user with no single "what is this
    // page" anchor.
    expect(h1).toHaveLength(1);
    expect(h1[0]).toHaveTextContent(/Accessible React components/);
  });

  it("offers the two primary calls to action", () => {
    render(<App />);
    expect(screen.getAllByRole("link", { name: /Get started/ }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /GitHub/ }).length).toBeGreaterThan(0);
  });

  it("names every landmark it renders", () => {
    render(<App />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    // Several navs on one page must be distinguishable.
    for (const nav of screen.getAllByRole("navigation")) {
      expect(nav).toHaveAccessibleName();
    }
  });

  it("renders every feature and principle from the content module", () => {
    render(<App />);
    for (const feature of features) {
      expect(screen.getByRole("heading", { name: feature.title })).toBeInTheDocument();
    }
    for (const line of principles) {
      expect(screen.getByText(line)).toBeInTheDocument();
    }
  });

  it("renders every stat", () => {
    render(<App />);
    for (const stat of stats) {
      expect(screen.getByText(stat.label)).toBeInTheDocument();
    }
  });

  it("labels the theme toggle by what pressing it does", () => {
    render(<App />);
    // Not by the current state — the outcome is what a user needs beforehand.
    expect(
      within(screen.getByRole("banner")).getByRole("button", {
        name: /Switch to (dark|light) mode/,
      }),
    ).toBeInTheDocument();
  });
});

describe("live showcase", () => {
  it("renders real components rather than images", () => {
    render(<App />);
    expect(screen.getByRole("tablist", { name: "Component groups" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Solid" })).toBeInTheDocument();
  });

  it("switches between component groups", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("tab", { name: "Forms" }));

    expect(await screen.findByLabelText("Email")).toBeInTheDocument();
  });

  it("opens a real dialog, traps focus and closes on Escape", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("tab", { name: "Overlays" }));
    await userEvent.click(await screen.findByRole("button", { name: "Dialog" }));

    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("drives a real slider with the keyboard", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("tab", { name: "Forms" }));

    const slider = await screen.findByRole("slider");
    const before = slider.getAttribute("aria-valuenow");

    slider.focus();
    await userEvent.keyboard("{ArrowRight}");

    expect(slider.getAttribute("aria-valuenow")).not.toBe(before);
  });
});

describe("the page does not overstate the project", () => {
  /**
   * The landing page makes numeric claims. These read the real repo rather than
   * trusting the copy, because a page that overstates its own project is worse
   * than one that says less — and these numbers drift every time a component
   * lands.
   */
  it("states the true component count", async () => {
    const modules = import.meta.glob("../../../packages/core/src/components/*/index.ts");
    const actual = Object.keys(modules).length;
    const claimed = Number(stats.find((s) => s.label === "components")!.value);

    expect(claimed).toBe(actual);
  });

  it("claims zero runtime dependencies only while that is true", async () => {
    const pkg = (await import("../../../packages/core/package.json")).default as {
      dependencies?: Record<string, string>;
    };

    expect(Object.keys(pkg.dependencies ?? {})).toEqual([]);
    expect(stats.find((s) => s.label === "runtime dependencies")!.value).toBe("0");
  });

  it("states the version the package actually publishes", async () => {
    const pkg = (await import("../../../packages/core/package.json")).default as {
      version: string;
    };
    const { VERSION } = await import("../src/content");

    expect(VERSION).toBe(pkg.version);
  });
});
