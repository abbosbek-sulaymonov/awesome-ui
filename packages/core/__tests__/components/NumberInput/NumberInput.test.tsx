import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NumberInput } from "../../../src/components/NumberInput/NumberInput";

const field = () => screen.getByRole("spinbutton", { name: /Quantity/ });

describe("NumberInput", () => {
  it("reports its value and bounds", () => {
    render(<NumberInput label="Quantity" defaultValue={5} min={0} max={10} />);

    expect(field()).toHaveAttribute("aria-valuenow", "5");
    expect(field()).toHaveAttribute("aria-valuemin", "0");
    expect(field()).toHaveAttribute("aria-valuemax", "10");
  });

  it("treats empty as null, not as zero", () => {
    const onValueChange = vi.fn();
    render(<NumberInput label="Quantity" defaultValue={5} onValueChange={onValueChange} />);

    // A blank field has no value; reporting 0 would be a number the user never
    // entered.
    return userEvent.clear(field()).then(() => {
      expect(onValueChange).toHaveBeenLastCalledWith(null);
      expect(field()).not.toHaveAttribute("aria-valuenow");
      expect(field()).toHaveAttribute("aria-valuetext", "Empty");
    });
  });

  it("steps with the arrow keys", async () => {
    const onValueChange = vi.fn();
    render(<NumberInput label="Quantity" defaultValue={5} step={2} onValueChange={onValueChange} />);

    field().focus();
    await userEvent.keyboard("{ArrowUp}");
    expect(onValueChange).toHaveBeenLastCalledWith(7);

    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(onValueChange).toHaveBeenLastCalledWith(3);
  });

  it("uses a larger jump for PageUp and PageDown", async () => {
    const onValueChange = vi.fn();
    render(<NumberInput label="Quantity" defaultValue={50} step={2} onValueChange={onValueChange} />);

    field().focus();
    await userEvent.keyboard("{PageUp}");
    expect(onValueChange).toHaveBeenLastCalledWith(70);
  });

  it("jumps to the bounds with Home and End", async () => {
    const onValueChange = vi.fn();
    render(<NumberInput label="Quantity" defaultValue={5} min={1} max={9} onValueChange={onValueChange} />);

    field().focus();
    await userEvent.keyboard("{End}");
    expect(onValueChange).toHaveBeenLastCalledWith(9);

    await userEvent.keyboard("{Home}");
    expect(onValueChange).toHaveBeenLastCalledWith(1);
  });

  it("steps with the buttons", async () => {
    const onValueChange = vi.fn();
    render(<NumberInput label="Quantity" defaultValue={5} onValueChange={onValueChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Increment" }));
    expect(onValueChange).toHaveBeenLastCalledWith(6);
  });

  it("disables the buttons at the bounds", () => {
    render(<NumberInput label="Quantity" defaultValue={10} min={0} max={10} />);

    expect(screen.getByRole("button", { name: "Increment" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Decrement" })).toBeEnabled();
  });

  it("starts from min when stepping up from empty", async () => {
    const onValueChange = vi.fn();
    render(<NumberInput label="Quantity" min={3} onValueChange={onValueChange} />);

    field().focus();
    await userEvent.keyboard("{ArrowUp}");

    // Starting at zero would land outside the allowed range on the first press.
    expect(onValueChange).toHaveBeenLastCalledWith(4);
  });

  it("lets you type a value longer than one digit inside a low cap", async () => {
    const onValueChange = vi.fn();
    render(<NumberInput label="Quantity" min={0} max={20} onValueChange={onValueChange} />);

    // Clamping on every keystroke would truncate "15" to "1" the moment only
    // the first digit exists.
    await userEvent.type(field(), "15");
    expect(field()).toHaveValue("15");
    expect(onValueChange).toHaveBeenLastCalledWith(15);
  });

  it("keeps intermediate text such as a lone minus sign", async () => {
    render(<NumberInput label="Quantity" min={-10} max={10} />);

    await userEvent.type(field(), "-");
    // "-" is not a number; parsing every keystroke would erase it immediately.
    expect(field()).toHaveValue("-");

    await userEvent.type(field(), "5");
    expect(field()).toHaveValue("-5");
  });

  it("keeps a trailing decimal point while typing", async () => {
    render(<NumberInput label="Quantity" step={0.1} />);

    await userEvent.type(field(), "1.");
    expect(field()).toHaveValue("1.");
  });

  it("clamps on blur rather than mid-typing", async () => {
    const onValueChange = vi.fn();
    render(
      <div>
        <NumberInput label="Quantity" min={0} max={20} onValueChange={onValueChange} />
        <button type="button">Elsewhere</button>
      </div>,
    );

    await userEvent.type(field(), "99");
    await userEvent.click(screen.getByRole("button", { name: "Elsewhere" }));

    expect(onValueChange).toHaveBeenLastCalledWith(20);
  });

  it("rounds to the precision the step implies", async () => {
    const onValueChange = vi.fn();
    render(<NumberInput label="Quantity" defaultValue={0.1} step={0.1} onValueChange={onValueChange} />);

    field().focus();
    await userEvent.keyboard("{ArrowUp}{ArrowUp}");

    // Naive accumulation gives 0.30000000000000004.
    expect(onValueChange).toHaveBeenLastCalledWith(0.3);
  });

  it("stays controlled when a value is supplied", async () => {
    const onValueChange = vi.fn();
    render(<NumberInput label="Quantity" value={5} onValueChange={onValueChange} />);

    field().focus();
    await userEvent.keyboard("{ArrowUp}");

    expect(onValueChange).toHaveBeenCalledWith(6);
    expect(field()).toHaveValue("5");
  });

  it("cannot be changed while disabled", async () => {
    const onValueChange = vi.fn();
    render(<NumberInput label="Quantity" defaultValue={5} disabled onValueChange={onValueChange} />);

    field().focus();
    await userEvent.keyboard("{ArrowUp}");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("wires description and error", () => {
    render(<NumberInput label="Quantity" description="How many?" errorMessage="Too many." />);

    expect(field()).toHaveAccessibleDescription("How many?");
    expect(field()).toHaveAttribute("aria-invalid", "true");
  });
});
