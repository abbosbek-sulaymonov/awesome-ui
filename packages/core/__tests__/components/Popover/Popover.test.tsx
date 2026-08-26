import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { resetLayerStack } from "../../../src/primitives/DismissableLayer";
import { Popover } from "../../../src/components/Popover/Popover";

afterEach(() => resetLayerStack());

function Basic(props: React.ComponentProps<typeof Popover.Root> = {}) {
  return (
    <div>
      <button type="button">Outside</button>
      <Popover.Root {...props}>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Content aria-label="Settings">
          <Popover.Arrow />
          <input aria-label="Name" />
          <Popover.Close>Done</Popover.Close>
        </Popover.Content>
      </Popover.Root>
    </div>
  );
}

describe("Popover", () => {
  it("toggles from the trigger", async () => {
    render(<Basic />);
    const trigger = screen.getByRole("button", { name: "Open" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "Settings" })).toBeInTheDocument();

    await userEvent.click(trigger);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("wires aria-expanded and aria-controls on the trigger", async () => {
    render(<Basic />);
    const trigger = screen.getByRole("button", { name: "Open" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).not.toHaveAttribute("aria-controls");

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-controls", screen.getByRole("dialog").id);
  });

  it("closes on an outside press", async () => {
    render(<Basic />);
    await userEvent.click(screen.getByRole("button", { name: "Open" }));

    await userEvent.click(screen.getByRole("button", { name: "Outside" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("stays open when pressing inside the content", async () => {
    render(<Basic />);
    await userEvent.click(screen.getByRole("button", { name: "Open" }));

    await userEvent.click(screen.getByLabelText("Name"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    render(<Basic />);
    const trigger = screen.getByRole("button", { name: "Open" });

    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("ignores outside presses when dismissOnOutsideClick is false", async () => {
    render(
      <div>
        <button type="button">Outside</button>
        <Popover.Root>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content aria-label="Sticky" dismissOnOutsideClick={false}>
            Body
          </Popover.Content>
        </Popover.Root>
      </div>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    await userEvent.click(screen.getByRole("button", { name: "Outside" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes from Popover.Close and restores focus", async () => {
    render(<Basic />);
    const trigger = screen.getByRole("button", { name: "Open" });

    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("button", { name: "Done" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("reports open changes to a controlled owner", async () => {
    const onOpenChange = vi.fn();
    render(<Basic open={false} onOpenChange={onOpenChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Open" }));

    expect(onOpenChange).toHaveBeenCalledWith(true);
    // Controlled and still false, so nothing rendered.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("exposes the resolved side as a data attribute", async () => {
    render(<Basic placement="right" />);
    await userEvent.click(screen.getByRole("button", { name: "Open" }));

    expect(screen.getByRole("dialog")).toHaveAttribute("data-side");
  });
});
