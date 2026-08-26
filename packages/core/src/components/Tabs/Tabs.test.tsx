import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Tabs } from "./Tabs";

function Basic(props: React.ComponentProps<typeof Tabs.Root> = {}) {
  return (
    <Tabs.Root defaultValue="account" {...props}>
      <Tabs.List label="Settings">
        <Tabs.Trigger value="account">Account</Tabs.Trigger>
        <Tabs.Trigger value="billing">Billing</Tabs.Trigger>
        <Tabs.Trigger value="team" disabled>
          Team
        </Tabs.Trigger>
        <Tabs.Trigger value="advanced">Advanced</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Panel value="account">Account panel</Tabs.Panel>
      <Tabs.Panel value="billing">Billing panel</Tabs.Panel>
      <Tabs.Panel value="team">Team panel</Tabs.Panel>
      <Tabs.Panel value="advanced">Advanced panel</Tabs.Panel>
    </Tabs.Root>
  );
}

describe("Tabs", () => {
  it("renders a named tablist with only the active panel", () => {
    render(<Basic />);

    expect(screen.getByRole("tablist", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Account", selected: true })).toBeInTheDocument();
    expect(screen.getByText("Account panel")).toBeInTheDocument();
    expect(screen.queryByText("Billing panel")).not.toBeInTheDocument();
  });

  it("wires each tab to its panel", () => {
    render(<Basic />);
    const tab = screen.getByRole("tab", { name: "Account" });
    const panel = screen.getByRole("tabpanel");

    expect(tab).toHaveAttribute("aria-controls", panel.id);
    expect(panel).toHaveAttribute("aria-labelledby", tab.id);
  });

  it("keeps only the active tab in the tab order", () => {
    render(<Basic />);

    expect(screen.getByRole("tab", { name: "Account" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("tab", { name: "Billing" })).toHaveAttribute("tabindex", "-1");
  });

  it("switches on click", async () => {
    const onValueChange = vi.fn();
    render(<Basic onValueChange={onValueChange} />);

    await userEvent.click(screen.getByRole("tab", { name: "Billing" }));

    expect(onValueChange).toHaveBeenCalledWith("billing");
    expect(screen.getByText("Billing panel")).toBeInTheDocument();
  });

  it("activates on arrow in automatic mode", async () => {
    render(<Basic />);
    screen.getByRole("tab", { name: "Account" }).focus();

    // Horizontal by default, so it is Right that moves.
    await userEvent.keyboard("{ArrowRight}");

    expect(screen.getByRole("tab", { name: "Billing" })).toHaveFocus();
    expect(screen.getByText("Billing panel")).toBeInTheDocument();
  });

  it("only moves focus in manual mode until Enter", async () => {
    const onValueChange = vi.fn();
    render(<Basic activation="manual" onValueChange={onValueChange} />);
    screen.getByRole("tab", { name: "Account" }).focus();

    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Billing" })).toHaveFocus();
    // Arrowing past three tabs must not fire three panel loads.
    expect(onValueChange).not.toHaveBeenCalled();

    await userEvent.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("billing");
  });

  it("steps over a disabled tab", async () => {
    render(<Basic defaultValue="billing" />);
    screen.getByRole("tab", { name: "Billing" }).focus();

    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Advanced" })).toHaveFocus();
  });

  it("wraps at the ends", async () => {
    render(<Basic />);
    screen.getByRole("tab", { name: "Account" }).focus();

    await userEvent.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Advanced" })).toHaveFocus();
  });

  it("uses vertical arrows when the orientation is vertical", async () => {
    render(<Basic orientation="vertical" />);
    const list = screen.getByRole("tablist");
    expect(list).toHaveAttribute("aria-orientation", "vertical");

    screen.getByRole("tab", { name: "Account" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("tab", { name: "Billing" })).toHaveFocus();
  });

  it("keeps panels mounted but hidden when asked", () => {
    render(
      <Tabs.Root defaultValue="a">
        <Tabs.List label="x">
          <Tabs.Trigger value="a">A</Tabs.Trigger>
          <Tabs.Trigger value="b">B</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="a">Panel A</Tabs.Panel>
        <Tabs.Panel value="b" keepMounted>
          Panel B
        </Tabs.Panel>
      </Tabs.Root>,
    );

    const hidden = screen.getByText("Panel B");
    expect(hidden).toBeInTheDocument();
    expect(hidden).not.toBeVisible();
  });

  it("stays controlled when a value is supplied", async () => {
    const onValueChange = vi.fn();
    render(<Basic value="account" onValueChange={onValueChange} />);

    await userEvent.click(screen.getByRole("tab", { name: "Billing" }));

    expect(onValueChange).toHaveBeenCalledWith("billing");
    expect(screen.getByText("Account panel")).toBeInTheDocument();
  });
});
