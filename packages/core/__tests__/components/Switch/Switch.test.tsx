import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "../../../src/components/Switch/Switch";

describe("Switch", () => {
  it("exposes the switch role rather than checkbox", () => {
    render(<Switch label="Email alerts" />);

    // role="switch" makes assistive tech say on/off instead of checked.
    expect(screen.getByRole("switch", { name: "Email alerts" })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("toggles from the label and reports the change", async () => {
    const onCheckedChange = vi.fn();
    render(<Switch label="Email alerts" onCheckedChange={onCheckedChange} />);

    await userEvent.click(screen.getByText("Email alerts"));

    expect(screen.getByRole("switch")).toBeChecked();
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("toggles with the keyboard", async () => {
    render(<Switch label="Email alerts" />);
    await userEvent.tab();
    await userEvent.keyboard(" ");

    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("honours defaultChecked", () => {
    render(<Switch label="Email alerts" defaultChecked />);
    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("stays controlled when a value is supplied", async () => {
    const onCheckedChange = vi.fn();
    render(<Switch label="Alerts" checked={false} onCheckedChange={onCheckedChange} />);

    await userEvent.click(screen.getByRole("switch"));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("switch")).not.toBeChecked();
  });

  it("wires description and error", () => {
    render(
      <Switch
        label="Alerts"
        description="Sent at most once a day."
        errorMessage="Verify your email first."
      />,
    );

    const control = screen.getByRole("switch");
    expect(control).toHaveAccessibleDescription("Sent at most once a day.");
    expect(control).toHaveAttribute("aria-invalid", "true");
  });

  it("cannot be toggled while disabled", async () => {
    render(<Switch label="Alerts" disabled />);
    await userEvent.click(screen.getByText("Alerts"));

    expect(screen.getByRole("switch")).not.toBeChecked();
  });

  it("reflects state as a data attribute for styling", async () => {
    const { container } = render(<Switch label="Alerts" />);
    const track = container.querySelector("[data-state]");

    expect(track).toHaveAttribute("data-state", "unchecked");
    await userEvent.click(screen.getByRole("switch"));
    expect(track).toHaveAttribute("data-state", "checked");
  });
});
