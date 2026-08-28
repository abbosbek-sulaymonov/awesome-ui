import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Collapsible } from "../../../src/components/Collapsible/Collapsible";

const Basic = (props: React.ComponentProps<typeof Collapsible.Root> = {}) => (
  <Collapsible.Root {...props}>
    <Collapsible.Trigger>Details</Collapsible.Trigger>
    <Collapsible.Panel>Panel body</Collapsible.Panel>
  </Collapsible.Root>
);

describe("Collapsible", () => {
  it("starts closed and opens on click", async () => {
    render(<Basic />);
    expect(screen.queryByText("Panel body")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Details" }));
    expect(screen.getByText("Panel body")).toBeInTheDocument();
  });

  it("wires the trigger to the panel", async () => {
    render(<Basic defaultOpen />);
    const trigger = screen.getByRole("button");
    const panel = screen.getByRole("region");

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-controls", panel.id);
    expect(panel).toHaveAttribute("aria-labelledby", trigger.id);
  });

  it("closes again", async () => {
    render(<Basic defaultOpen />);
    await userEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(screen.queryByText("Panel body")).not.toBeInTheDocument());
  });

  it("reports open changes", async () => {
    const onOpenChange = vi.fn();
    render(<Basic onOpenChange={onOpenChange} />);

    await userEvent.click(screen.getByRole("button"));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("stays controlled when open is supplied", async () => {
    const onOpenChange = vi.fn();
    render(<Basic open={false} onOpenChange={onOpenChange} />);

    await userEvent.click(screen.getByRole("button"));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByText("Panel body")).not.toBeInTheDocument();
  });

  it("cannot be toggled while disabled", async () => {
    render(<Basic disabled />);
    const trigger = screen.getByRole("button");

    expect(trigger).toBeDisabled();
    await userEvent.click(trigger);
    expect(screen.queryByText("Panel body")).not.toBeInTheDocument();
  });

  it("keeps the panel mounted but hidden when asked", () => {
    render(
      <Collapsible.Root>
        <Collapsible.Trigger>Details</Collapsible.Trigger>
        <Collapsible.Panel keepMounted>Panel body</Collapsible.Panel>
      </Collapsible.Root>,
    );

    const panel = screen.getByText("Panel body");
    expect(panel).toBeInTheDocument();
    expect(panel).not.toBeVisible();
  });
});
