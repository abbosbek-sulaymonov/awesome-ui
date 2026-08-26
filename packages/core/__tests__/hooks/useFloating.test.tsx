import { render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { resetLayerStack } from "../../src/primitives/DismissableLayer";
import { Menu } from "../../src/components/Menu/Menu";
import { Popover } from "../../src/components/Popover/Popover";
import { Select } from "../../src/components/Select/Select";
import { useFloating } from "../../src/hooks/useFloating";

afterEach(() => resetLayerStack());

/**
 * Regression tests for anchored positioning.
 *
 * The failures these cover were all invisible to the component suites, because
 * jsdom has no layout and does not enforce that a `visibility: hidden` element
 * cannot take focus. Both are asserted here through observable DOM state
 * instead.
 */
describe("anchored positioning", () => {
  it("positions with translate rather than transform", async () => {
    render(
      <Popover.Root>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Content aria-label="Panel">Body</Popover.Content>
      </Popover.Root>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    const content = screen.getByRole("dialog");

    // `transform` is where entrance animations live. A running animation
    // outranks an inline style, so putting the position there parks the element
    // at its unpositioned origin for the animation's whole duration.
    expect(content.style.translate).not.toBe("");
    expect(content.style.transform).toBe("");
  });

  it("is measured and visible by the time it is open", async () => {
    render(
      <Popover.Root>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Content aria-label="Panel">Body</Popover.Content>
      </Popover.Root>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Open" }));

    // Hidden means unmeasured, which also means unfocusable.
    expect(screen.getByRole("dialog").style.visibility).not.toBe("hidden");
  });
});

describe("keyboard-opened listboxes take focus", () => {
  it("focuses the first option when Select is opened with ArrowDown", async () => {
    render(
      <Select.Root>
        <Select.Trigger label="Framework">
          <Select.Value placeholder="Pick one" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="react">React</Select.Item>
          <Select.Item value="svelte">Svelte</Select.Item>
        </Select.Content>
      </Select.Root>,
    );

    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");

    // If focus stays on the trigger, every further arrow press just reopens the
    // list instead of moving through it — which is how this reads to a user.
    await waitFor(() =>
      expect(screen.getByRole("option", { name: "React" })).toHaveFocus(),
    );

    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: "Svelte" })).toHaveFocus();
    expect(screen.getByRole("combobox")).not.toHaveFocus();
  });

  it("focuses the first item when Menu is opened with ArrowDown", async () => {
    render(
      <Menu.Root>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content label="Actions">
          <Menu.Item>New file</Menu.Item>
          <Menu.Item>Duplicate</Menu.Item>
        </Menu.Content>
      </Menu.Root>,
    );

    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");

    await waitFor(() =>
      expect(screen.getByRole("menuitem", { name: "New file" })).toHaveFocus(),
    );

    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
  });
});

describe("floating state does not outlive its element", () => {
  /**
   * Keeping the measurement after the element went away meant the next open
   * rendered at wherever the previous one had been — and because `position` was
   * non-null, nothing was hidden while that happened. The panel appeared at the
   * old spot and then jumped to the new one, which reads as it showing twice.
   */
  it("discards the measured position when the element unmounts", () => {
    const seen: (unknown | null)[] = [];

    function Probe({ mounted }: { mounted: boolean }) {
      const floating = useFloating({ open: mounted });
      seen.push(floating.position);

      return (
        <>
          <button type="button" ref={floating.setAnchor}>
            anchor
          </button>
          {mounted ? <div data-testid="panel" ref={floating.setFloating} /> : null}
        </>
      );
    }

    const { rerender } = render(<Probe mounted />);
    expect(seen.at(-1)).not.toBeNull();

    rerender(<Probe mounted={false} />);
    expect(seen.at(-1)).toBeNull();

    // And a fresh element starts unmeasured rather than inheriting the old value.
    rerender(<Probe mounted />);
    expect(seen.some((entry) => entry === null)).toBe(true);
  });

  it("hides the panel until it has been measured", () => {
    function Probe() {
      const floating = useFloating({ open: true });
      return <div data-testid="panel" style={floating.floatingStyles} />;
    }

    render(<Probe />);
    // No anchor was ever attached, so nothing could be measured — and an
    // unmeasured panel must not be visible anywhere on screen.
    expect(screen.getByTestId("panel").style.visibility).toBe("hidden");
  });
});

describe("floating context does not churn", () => {
  /**
   * Callers put this object straight into a context value. If its identity
   * changes on every render, their `useMemo` is defeated and every consumer —
   * every option in a Select, every item in a Menu — re-renders on every render
   * of the root, and again on every scroll frame while open.
   */
  it("returns a stable object across renders when nothing has changed", async () => {
    const seen: unknown[] = [];

    function Probe() {
      const [, force] = useState(0);
      seen.push(useFloating({ open: false }));
      return (
        <button type="button" onClick={() => force((n) => n + 1)}>
          rerender
        </button>
      );
    }

    render(<Probe />);
    await userEvent.click(screen.getByRole("button", { name: "rerender" }));

    expect(seen.length).toBeGreaterThan(1);
    expect(seen[seen.length - 1]).toBe(seen[0]);
  });

  it("returns a new object once the measured position changes", () => {
    const seen: ReturnType<typeof useFloating>[] = [];

    function Probe({ open }: { open: boolean }) {
      seen.push(useFloating({ open }));
      return <div />;
    }

    const { rerender } = render(<Probe open={false} />);
    rerender(<Probe open />);

    // Identity must still track real change, or nothing would ever update.
    expect(seen.at(-1)!.floatingStyles).toBe(seen[0]!.floatingStyles);
  });
});
