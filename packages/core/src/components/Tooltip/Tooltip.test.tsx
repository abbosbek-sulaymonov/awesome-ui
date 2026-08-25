import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Tooltip } from "./Tooltip";

function Basic(props: React.ComponentProps<typeof Tooltip.Root> = {}) {
  return (
    <Tooltip.Root openDelay={0} closeDelay={0} {...props}>
      <Tooltip.Trigger aria-label="Save">Save</Tooltip.Trigger>
      <Tooltip.Content>
        <Tooltip.Arrow />
        Saves your changes
      </Tooltip.Content>
    </Tooltip.Root>
  );
}

describe("Tooltip", () => {
  it("shows on hover and hides on leave", async () => {
    render(<Basic />);
    const trigger = screen.getByRole("button", { name: "Save" });

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    await userEvent.hover(trigger);
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Saves your changes");

    await userEvent.unhover(trigger);
    await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
  });

  it("shows on keyboard focus", async () => {
    render(<Basic />);
    await userEvent.tab();

    expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
    expect(await screen.findByRole("tooltip")).toBeInTheDocument();
  });

  it("describes rather than names the trigger", async () => {
    render(<Basic />);
    const trigger = screen.getByRole("button", { name: "Save" });

    await userEvent.hover(trigger);
    await screen.findByRole("tooltip");

    // The tooltip supplements the control; it must not become its name.
    expect(trigger).toHaveAccessibleName("Save");
    expect(trigger).toHaveAccessibleDescription("Saves your changes");
  });

  it("drops aria-describedby once hidden", async () => {
    render(<Basic />);
    const trigger = screen.getByRole("button", { name: "Save" });

    await userEvent.hover(trigger);
    await screen.findByRole("tooltip");
    expect(trigger).toHaveAttribute("aria-describedby");

    await userEvent.unhover(trigger);
    await waitFor(() => expect(trigger).not.toHaveAttribute("aria-describedby"));
  });

  it("hides on Escape while shown", async () => {
    render(<Basic />);
    await userEvent.hover(screen.getByRole("button", { name: "Save" }));
    await screen.findByRole("tooltip");

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
  });

  it("never opens while disabled", async () => {
    render(<Basic disabled />);
    await userEvent.hover(screen.getByRole("button", { name: "Save" }));

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("waits out openDelay before showing on hover", async () => {
    // Real timers rather than fake ones: React 19's scheduler does not flush
    // under a faked clock, so the render never settles.
    render(<Basic openDelay={120} closeDelay={0} />);
    await userEvent.hover(screen.getByRole("button", { name: "Save" }));

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(await screen.findByRole("tooltip")).toBeInTheDocument();
  });

  it("skips the delay for keyboard focus", async () => {
    // A delay long enough that any hover-style scheduling would still be pending.
    render(<Basic openDelay={5000} closeDelay={0} />);
    await userEvent.tab();

    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

});
