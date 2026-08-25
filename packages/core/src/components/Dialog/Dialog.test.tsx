import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { resetLayerStack } from "../../primitives/DismissableLayer";
import { Dialog } from "./Dialog";

afterEach(() => resetLayerStack());

function Basic(props: React.ComponentProps<typeof Dialog.Root> = {}) {
  return (
    <Dialog.Root {...props}>
      <Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Overlay />
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Delete project</Dialog.Title>
          <Dialog.Description>This cannot be undone.</Dialog.Description>
        </Dialog.Header>
        <input aria-label="Confirm name" />
        <Dialog.Footer>
          <Dialog.Close>Cancel</Dialog.Close>
          <button type="button">Delete</button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}

describe("Dialog", () => {
  it("is closed until the trigger is pressed", async () => {
    render(<Basic />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("names and describes itself from Title and Description", async () => {
    render(<Basic />);
    await userEvent.click(screen.getByRole("button", { name: "Open" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAccessibleName("Delete project");
    expect(dialog).toHaveAccessibleDescription("This cannot be undone.");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("omits aria-labelledby when no Title is rendered", async () => {
    render(
      <Dialog.Root>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Content aria-label="Bare dialog">Body</Dialog.Content>
      </Dialog.Root>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Open" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).not.toHaveAttribute("aria-labelledby");
    expect(dialog).toHaveAccessibleName("Bare dialog");
  });

  it("moves focus into the dialog on open and back to the trigger on close", async () => {
    render(<Basic />);
    const trigger = screen.getByRole("button", { name: "Open" });

    await userEvent.click(trigger);
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toContainElement(
        document.activeElement as HTMLElement,
      );
    });

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("cycles focus with Tab instead of escaping to the page", async () => {
    render(
      <>
        <button type="button">Outside before</button>
        <Basic />
        <button type="button">Outside after</button>
      </>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    const dialog = await screen.findByRole("dialog");

    // Walk past the end of the dialog's tab order and confirm it wraps back.
    for (let i = 0; i < 8; i++) {
      await userEvent.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
  });

  it("closes on Escape", async () => {
    const onOpenChange = vi.fn();
    render(<Basic onOpenChange={onOpenChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    await userEvent.keyboard("{Escape}");

    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("ignores Escape when dismissOnEscape is false", async () => {
    render(<Basic dismissOnEscape={false} />);

    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    await userEvent.keyboard("{Escape}");

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes from Dialog.Close", async () => {
    render(<Basic />);
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("closes from the built-in close button", async () => {
    render(<Basic />);
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    await userEvent.click(screen.getByRole("button", { name: "Close dialog" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("supports controlled open state", async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(<Basic open={false} onOpenChange={onOpenChange} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    rerender(<Basic open onOpenChange={onOpenChange} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("marks the trigger as expanded while open", async () => {
    render(<Basic />);
    const trigger = screen.getByRole("button", { name: "Open" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("locks background scrolling while open and restores it after", async () => {
    render(<Basic />);
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(document.body.style.overflow).toBe("hidden");

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(document.body.style.overflow).not.toBe("hidden"));
  });

  it("closes only the top dialog when two are stacked", async () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Content aria-label="Outer">
          Outer body
          <Dialog.Root>
            <Dialog.Trigger>Open inner</Dialog.Trigger>
            <Dialog.Content aria-label="Inner">Inner body</Dialog.Content>
          </Dialog.Root>
        </Dialog.Content>
      </Dialog.Root>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Open inner" }));
    expect(screen.getByRole("dialog", { name: "Inner" })).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");

    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Inner" })).not.toBeInTheDocument(),
    );
    expect(screen.getByRole("dialog", { name: "Outer" })).toBeInTheDocument();
  });
});
