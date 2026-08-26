import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { resetLayerStack } from "../../../src/primitives/DismissableLayer";
import { Menu } from "../../../src/components/Menu/Menu";

afterEach(() => resetLayerStack());

function Basic(props: React.ComponentProps<typeof Menu.Root> = {}) {
  return (
    <div>
      <button type="button">Outside</button>
      <Menu.Root {...props}>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content label="Actions">
          <Menu.Group>
            <Menu.Label>File</Menu.Label>
            <Menu.Item shortcut="⌘N">New file</Menu.Item>
            <Menu.Item>Duplicate</Menu.Item>
            <Menu.Item disabled>Archive</Menu.Item>
          </Menu.Group>
          <Menu.Separator />
          <Menu.Item danger>Delete</Menu.Item>
        </Menu.Content>
      </Menu.Root>
    </div>
  );
}

const trigger = () => screen.getByRole("button", { name: "Actions" });

describe("Menu", () => {
  it("opens from the trigger", async () => {
    render(<Basic />);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await userEvent.click(trigger());

    expect(screen.getByRole("menu", { name: "Actions" })).toBeInTheDocument();
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    expect(trigger()).toHaveAttribute("aria-controls", screen.getByRole("menu").id);
  });

  it("opens with the first item focused", async () => {
    render(<Basic />);
    await userEvent.click(trigger());

    // Leaving focus on the trigger would make the arrow keys do nothing.
    await waitFor(() =>
      expect(screen.getByRole("menuitem", { name: /New file/ })).toHaveFocus(),
    );
  });

  it("opens from the keyboard with ArrowDown", async () => {
    render(<Basic />);
    trigger().focus();

    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("moves through items with arrow keys, skipping disabled ones", async () => {
    render(<Basic />);
    await userEvent.click(trigger());
    await waitFor(() => expect(screen.getByRole("menuitem", { name: /New file/ })).toHaveFocus());

    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();

    // Archive is disabled and must be stepped over.
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
  });

  it("jumps to an item by typing", async () => {
    render(<Basic />);
    await userEvent.click(trigger());
    await waitFor(() => expect(screen.getByRole("menuitem", { name: /New file/ })).toHaveFocus());

    await userEvent.keyboard("du");
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();
  });

  it("selects with Enter, closes, and restores focus", async () => {
    const onSelect = vi.fn();
    render(
      <Menu.Root>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content label="Actions">
          <Menu.Item onSelect={onSelect}>New file</Menu.Item>
        </Menu.Content>
      </Menu.Root>,
    );

    await userEvent.click(trigger());
    await waitFor(() => expect(screen.getByRole("menuitem")).toHaveFocus());
    await userEvent.keyboard("{Enter}");

    expect(onSelect).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    expect(trigger()).toHaveFocus();
  });

  it("stays open when an item prevents the default", async () => {
    render(
      <Menu.Root>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content label="Actions">
          <Menu.Item onSelect={(event) => event.preventDefault()}>Stay</Menu.Item>
        </Menu.Content>
      </Menu.Root>,
    );

    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole("menuitem", { name: "Stay" }));

    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("does not fire onSelect for a disabled item", async () => {
    const onSelect = vi.fn();
    render(
      <Menu.Root>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content label="Actions">
          <Menu.Item disabled onSelect={onSelect}>
            Archive
          </Menu.Item>
        </Menu.Content>
      </Menu.Root>,
    );

    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole("menuitem", { name: "Archive" }), {
      pointerEventsCheck: 0,
    });

    expect(onSelect).not.toHaveBeenCalled();
  });

  it("toggles a checkbox item without closing", async () => {
    const onCheckedChange = vi.fn();
    render(
      <Menu.Root>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content label="Actions">
          <Menu.CheckboxItem checked={false} onCheckedChange={onCheckedChange}>
            Show sidebar
          </Menu.CheckboxItem>
        </Menu.Content>
      </Menu.Root>,
    );

    await userEvent.click(trigger());
    const item = screen.getByRole("menuitemcheckbox", { name: "Show sidebar" });
    expect(item).toHaveAttribute("aria-checked", "false");

    await userEvent.click(item);

    expect(onCheckedChange).toHaveBeenCalledWith(true);
    // A toggle stays open so several things can be flipped in one visit.
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("closes on Escape and restores focus", async () => {
    render(<Basic />);
    await userEvent.click(trigger());
    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    expect(trigger()).toHaveFocus();
  });

  it("closes on an outside press", async () => {
    render(<Basic />);
    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole("button", { name: "Outside" }));

    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
  });

  it("renders its trigger as a child element under asChild", async () => {
    render(
      <Menu.Root>
        <Menu.Trigger asChild>
          <a href="#actions">Actions</a>
        </Menu.Trigger>
        <Menu.Content label="Actions">
          <Menu.Item>New file</Menu.Item>
        </Menu.Content>
      </Menu.Root>,
    );

    const link = screen.getByRole("link", { name: "Actions" });
    expect(link).toHaveAttribute("aria-haspopup", "menu");

    await userEvent.click(link);
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });
});
