import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { useRovingFocus } from "./useRovingFocus";
import type { RovingOrientation } from "./useRovingFocus";

function Collection({
  orientation,
  loop,
}: {
  orientation?: RovingOrientation;
  loop?: boolean;
}) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useRovingFocus({
    container,
    active: true,
    ...(orientation ? { orientation } : {}),
    ...(loop === undefined ? {} : { loop }),
    itemSelector: '[role="menuitem"]:not([data-disabled])',
  });

  return (
    <div ref={setContainer} role="menu">
      {["One", "Two", "Three"].map((label) => (
        <div key={label} role="menuitem" tabIndex={-1}>
          {label}
        </div>
      ))}
    </div>
  );
}

const item = (name: string) => screen.getByRole("menuitem", { name });

describe("useRovingFocus", () => {
  it("moves with vertical arrows by default", async () => {
    render(<Collection />);
    item("One").focus();

    await userEvent.keyboard("{ArrowDown}");
    expect(item("Two")).toHaveFocus();

    await userEvent.keyboard("{ArrowUp}");
    expect(item("One")).toHaveFocus();
  });

  it("ignores horizontal arrows when vertical", async () => {
    render(<Collection />);
    item("One").focus();

    // Left/Right must stay available for text cursors and nested widgets.
    await userEvent.keyboard("{ArrowRight}");
    expect(item("One")).toHaveFocus();
  });

  it("moves with horizontal arrows when configured", async () => {
    render(<Collection orientation="horizontal" />);
    item("One").focus();

    await userEvent.keyboard("{ArrowRight}");
    expect(item("Two")).toHaveFocus();

    await userEvent.keyboard("{ArrowDown}");
    expect(item("Two")).toHaveFocus();
  });

  it("accepts both axes when orientation is both", async () => {
    render(<Collection orientation="both" />);
    item("One").focus();

    await userEvent.keyboard("{ArrowRight}");
    expect(item("Two")).toHaveFocus();

    await userEvent.keyboard("{ArrowDown}");
    expect(item("Three")).toHaveFocus();
  });

  it("wraps at the ends by default", async () => {
    render(<Collection />);
    item("One").focus();

    await userEvent.keyboard("{ArrowUp}");
    expect(item("Three")).toHaveFocus();
  });

  it("stops at the ends when loop is false", async () => {
    render(<Collection loop={false} />);
    item("One").focus();

    await userEvent.keyboard("{ArrowUp}");
    expect(item("One")).toHaveFocus();

    await userEvent.keyboard("{End}");
    await userEvent.keyboard("{ArrowDown}");
    expect(item("Three")).toHaveFocus();
  });

  it("jumps to the ends with Home and End", async () => {
    render(<Collection />);
    item("One").focus();

    await userEvent.keyboard("{End}");
    expect(item("Three")).toHaveFocus();

    await userEvent.keyboard("{Home}");
    expect(item("One")).toHaveFocus();
  });
});
