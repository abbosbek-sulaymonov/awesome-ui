import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { resetLayerStack } from "../primitives/DismissableLayer";
import { Menu } from "../components/Menu/Menu";
import { Popover } from "../components/Popover/Popover";
import { Select } from "../components/Select/Select";

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
