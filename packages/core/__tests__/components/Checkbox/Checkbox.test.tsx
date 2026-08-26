import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "../../../src/components/Checkbox/Checkbox";

describe("Checkbox", () => {
  it("renders a real checkbox associated with its label", () => {
    render(<Checkbox label="Accept terms" />);
    const box = screen.getByRole("checkbox", { name: /Accept terms/ });

    expect(box).toBeInstanceOf(HTMLInputElement);
    expect(box).toHaveAttribute("type", "checkbox");
  });

  it("toggles when the label is clicked", async () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox label="Accept terms" onCheckedChange={onCheckedChange} />);

    await userEvent.click(screen.getByText("Accept terms"));

    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("toggles with the keyboard", async () => {
    render(<Checkbox label="Accept terms" />);
    await userEvent.tab();
    await userEvent.keyboard(" ");

    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("reports mixed state when indeterminate", () => {
    render(<Checkbox label="Select all" indeterminate />);
    const box = screen.getByRole("checkbox");

    expect(box).toHaveAttribute("aria-checked", "mixed");
    // The DOM property has no attribute equivalent, so it must be set directly.
    expect((box as HTMLInputElement).indeterminate).toBe(true);
  });

  it("clears the indeterminate DOM property when the prop goes away", () => {
    const { rerender } = render(<Checkbox label="Select all" indeterminate />);
    expect((screen.getByRole("checkbox") as HTMLInputElement).indeterminate).toBe(true);

    rerender(<Checkbox label="Select all" indeterminate={false} />);
    expect((screen.getByRole("checkbox") as HTMLInputElement).indeterminate).toBe(false);
  });

  it("wires description and error for assistive tech", () => {
    render(
      <Checkbox
        label="Accept terms"
        description="You can revoke this later."
        errorMessage="You must accept to continue."
      />,
    );

    const box = screen.getByRole("checkbox");
    expect(box).toHaveAccessibleDescription("You can revoke this later.");
    expect(box).toHaveAttribute("aria-invalid", "true");
    expect(box).toHaveAttribute(
      "aria-errormessage",
      screen.getByText("You must accept to continue.").id,
    );
  });

  it("does not point aria-describedby at an element it never rendered", () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByRole("checkbox")).not.toHaveAttribute("aria-describedby");
  });

  it("stays controlled when a value is supplied", async () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox label="Accept" checked={false} onCheckedChange={onCheckedChange} />);

    await userEvent.click(screen.getByRole("checkbox"));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("cannot be toggled while disabled", async () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox label="Accept" disabled onCheckedChange={onCheckedChange} />);

    await userEvent.click(screen.getByText("Accept"));

    expect(screen.getByRole("checkbox")).not.toBeChecked();
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("participates in a form submission", async () => {
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      expect(data.get("terms")).toBe("on");
    });

    render(
      <form onSubmit={onSubmit}>
        <Checkbox name="terms" label="Accept" defaultChecked />
        <button type="submit">Submit</button>
      </form>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("forwards the ref to the input", () => {
    let node: HTMLInputElement | null = null;
    render(<Checkbox label="Accept" ref={(element) => void (node = element)} />);
    expect(node).toBeInstanceOf(HTMLInputElement);
  });
});
