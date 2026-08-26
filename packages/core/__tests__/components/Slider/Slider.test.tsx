import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Slider } from "../../../src/components/Slider/Slider";

const thumb = (name?: string) =>
  name ? screen.getByRole("slider", { name }) : screen.getByRole("slider");

describe("Slider", () => {
  it("exposes the thumb as the slider, not the track", () => {
    render(<Slider defaultValue={40} label="Volume" />);

    const control = thumb();
    expect(control).toHaveAttribute("aria-valuenow", "40");
    expect(control).toHaveAttribute("aria-valuemin", "0");
    expect(control).toHaveAttribute("aria-valuemax", "100");
    expect(control).toHaveAttribute("tabindex", "0");
  });

  it("moves by one step with the arrow keys", async () => {
    const onValueChange = vi.fn();
    render(<Slider defaultValue={40} step={5} label="Volume" onValueChange={onValueChange} />);

    thumb().focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onValueChange).toHaveBeenLastCalledWith(45);

    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(onValueChange).toHaveBeenLastCalledWith(35);
  });

  it("uses a larger jump for PageUp and PageDown", async () => {
    const onValueChange = vi.fn();
    render(<Slider defaultValue={50} step={2} label="Volume" onValueChange={onValueChange} />);

    thumb().focus();
    await userEvent.keyboard("{PageUp}");
    // Ten steps by default.
    expect(onValueChange).toHaveBeenLastCalledWith(70);
  });

  it("jumps to the bounds with Home and End", async () => {
    const onValueChange = vi.fn();
    render(<Slider defaultValue={50} min={10} max={90} label="Volume" onValueChange={onValueChange} />);

    thumb().focus();
    await userEvent.keyboard("{End}");
    expect(onValueChange).toHaveBeenLastCalledWith(90);

    await userEvent.keyboard("{Home}");
    expect(onValueChange).toHaveBeenLastCalledWith(10);
  });

  it("never leaves the bounds", async () => {
    const onValueChange = vi.fn();
    render(<Slider defaultValue={100} label="Volume" onValueChange={onValueChange} />);

    thumb().focus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    expect(thumb()).toHaveAttribute("aria-valuenow", "100");
  });

  it("snaps to steps measured from min, not from zero", async () => {
    const onValueChange = vi.fn();
    // min 5 step 10 should offer 5, 15, 25 — not 10, 20, 30 with 5 unreachable.
    render(<Slider defaultValue={5} min={5} max={95} step={10} label="V" onValueChange={onValueChange} />);

    thumb().focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onValueChange).toHaveBeenLastCalledWith(15);
  });

  it("does not surface float drift in the value", async () => {
    const onValueChange = vi.fn();
    render(<Slider defaultValue={0.1} min={0} max={1} step={0.1} label="V" onValueChange={onValueChange} />);

    thumb().focus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");

    // Naive accumulation gives 0.30000000000000004 and shows it in the label.
    expect(onValueChange).toHaveBeenLastCalledWith(0.3);
  });

  it("renders two thumbs for a range and names them", () => {
    render(<Slider defaultValue={[20, 80]} />);

    expect(screen.getAllByRole("slider")).toHaveLength(2);
    expect(thumb("Minimum")).toHaveAttribute("aria-valuenow", "20");
    expect(thumb("Maximum")).toHaveAttribute("aria-valuenow", "80");
  });

  it("bounds each range thumb by the other", () => {
    render(<Slider defaultValue={[20, 80]} />);

    // The lower thumb cannot be reported as able to exceed the upper.
    expect(thumb("Minimum")).toHaveAttribute("aria-valuemax", "80");
    expect(thumb("Maximum")).toHaveAttribute("aria-valuemin", "20");
  });

  it("clamps range thumbs against each other rather than swapping them", async () => {
    const onValueChange = vi.fn();
    render(<Slider defaultValue={[50, 51]} step={5} onValueChange={onValueChange} />);

    thumb("Minimum").focus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");

    // Swapping would change which thumb is under the pointer mid-gesture and
    // lose keyboard focus, so the lower thumb stops at the upper instead.
    const [lowValue, highValue] = onValueChange.mock.calls.at(-1)![0] as [number, number];
    expect(lowValue).toBeLessThanOrEqual(highValue);
    expect(highValue).toBe(51);
  });

  it("keeps a required gap between range thumbs", async () => {
    const onValueChange = vi.fn();
    render(
      <Slider defaultValue={[40, 60]} step={1} minStepsBetweenThumbs={10} onValueChange={onValueChange} />,
    );

    thumb("Minimum").focus();
    for (let i = 0; i < 20; i++) await userEvent.keyboard("{ArrowRight}");

    const [lowValue, highValue] = onValueChange.mock.calls.at(-1)![0] as [number, number];
    expect(highValue - lowValue).toBeGreaterThanOrEqual(10);
  });

  it("reports a commit once on a key press", async () => {
    const onValueCommit = vi.fn();
    render(<Slider defaultValue={40} label="V" onValueCommit={onValueCommit} />);

    thumb().focus();
    await userEvent.keyboard("{ArrowRight}");

    expect(onValueCommit).toHaveBeenCalledTimes(1);
    expect(onValueCommit).toHaveBeenCalledWith(41);
  });

  it("speaks the formatted value", () => {
    render(<Slider defaultValue={42} label="V" formatValue={(n) => `${n} percent`} />);
    expect(thumb()).toHaveAttribute("aria-valuetext", "42 percent");
  });

  it("cannot be moved while disabled", async () => {
    const onValueChange = vi.fn();
    render(<Slider defaultValue={40} label="V" disabled onValueChange={onValueChange} />);

    thumb().focus();
    await userEvent.keyboard("{ArrowRight}");

    expect(onValueChange).not.toHaveBeenCalled();
    expect(thumb()).toHaveAttribute("tabindex", "-1");
  });

  it("submits its value with a form", () => {
    const { container } = render(<Slider defaultValue={[10, 30]} name="range" />);
    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="hidden"]');

    // A div with role="slider" submits nothing on its own.
    expect(Array.from(inputs).map((input) => [input.name, input.value])).toEqual([
      ["range[0]", "10"],
      ["range[1]", "30"],
    ]);
  });

  it("stays controlled when a value is supplied", async () => {
    const onValueChange = vi.fn();
    render(<Slider value={40} label="V" onValueChange={onValueChange} />);

    thumb().focus();
    await userEvent.keyboard("{ArrowRight}");

    expect(onValueChange).toHaveBeenCalledWith(41);
    expect(thumb()).toHaveAttribute("aria-valuenow", "40");
  });
});
