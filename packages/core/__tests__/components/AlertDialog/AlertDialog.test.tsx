import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useRef } from "react";
import { resetLayerStack } from "../../../src/primitives/DismissableLayer";
import { AlertDialog } from "../../../src/components/AlertDialog/AlertDialog";

afterEach(() => resetLayerStack());

const Basic = (props: React.ComponentProps<typeof AlertDialog.Root> = {}) => (
  <div>
    <button type="button">Outside</button>
    <AlertDialog.Root {...props}>
      <AlertDialog.Trigger>Delete</AlertDialog.Trigger>
      <AlertDialog.Overlay />
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>Delete project?</AlertDialog.Title>
          <AlertDialog.Description>This cannot be undone.</AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
          <AlertDialog.Action>Delete</AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Root>
  </div>
);

describe("AlertDialog", () => {
  it("uses the alertdialog role", async () => {
    render(<Basic />);
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    // alertdialog tells assistive tech this is urgent and makes it read the
    // description immediately rather than waiting to be asked.
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("names and describes itself", async () => {
    render(<Basic />);
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveAccessibleName("Delete project?");
    expect(dialog).toHaveAccessibleDescription("This cannot be undone.");
  });

  it("never dismisses on an outside press", async () => {
    render(<Basic />);
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    // A confirmation is a question; clicking away is an ambiguous answer to it.
    await userEvent.click(screen.getByRole("button", { name: "Outside" }));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("has no close button in the corner", async () => {
    render(<Basic />);
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    // Cancelling is one of the actions, not a way out of the frame.
    expect(screen.queryByRole("button", { name: /close/i })).not.toBeInTheDocument();
  });

  it("still closes on Escape", async () => {
    render(<Basic />);
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    // Trapping someone with no keyboard exit is worse than an accidental cancel.
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  });

  it("can refuse Escape too", async () => {
    render(<Basic dismissOnEscape={false} />);
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    await userEvent.keyboard("{Escape}");
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("closes from either action", async () => {
    render(<Basic />);
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  });

  it("runs the action handler", async () => {
    const onConfirm = vi.fn();
    render(
      <AlertDialog.Root defaultOpen>
        <AlertDialog.Content>
          <AlertDialog.Title>Sure?</AlertDialog.Title>
          <AlertDialog.Action onClick={onConfirm}>Confirm</AlertDialog.Action>
        </AlertDialog.Content>
      </AlertDialog.Root>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("opens with focus on the control the ref names", async () => {
    function Harness() {
      const cancelRef = useRef<HTMLButtonElement>(null);
      return (
        <AlertDialog.Root>
          <AlertDialog.Trigger>Delete</AlertDialog.Trigger>
          <AlertDialog.Content initialFocusRef={cancelRef}>
            <AlertDialog.Title>Sure?</AlertDialog.Title>
            <AlertDialog.Cancel ref={cancelRef}>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action>Delete it</AlertDialog.Action>
          </AlertDialog.Content>
        </AlertDialog.Root>
      );
    }

    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    // A destructive dialog should not open with the destructive button under
    // the return key.
    await waitFor(() => expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus());
  });
});
