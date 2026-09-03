import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { resetLayerStack } from "../../../src/primitives/DismissableLayer";
import { DatePicker } from "../../../src/components/DatePicker/DatePicker";
import { formatFullDate, toISODate } from "../../../src/utils/date";

afterEach(() => resetLayerStack());

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);
const LOCALE = "en-GB";

const Basic = (props: Partial<React.ComponentProps<typeof DatePicker>> = {}) => (
  <DatePicker label="Starts on" locale={LOCALE} {...props} />
);

const field = () => screen.getByLabelText("Starts on");
const dayButton = (day: number, month = 3) =>
  screen.getByRole("button", { name: formatFullDate(d(2026, month, day), LOCALE) });

describe("DatePicker", () => {
  it("keeps the field editable rather than making it a trigger", async () => {
    // Typing beats paging a grid for anyone who knows the date, and it is the
    // only route for a birth year decades back.
    render(<Basic />);
    await userEvent.type(field(), "2026-03-17");

    expect(field()).toHaveValue("2026-03-17");
  });

  it("reports a typed date", async () => {
    const onValueChange = vi.fn();
    render(<Basic onValueChange={onValueChange} />);

    await userEvent.type(field(), "2026-03-17");

    const last = onValueChange.mock.calls.at(-1)![0] as Date;
    expect(toISODate(last)).toBe("2026-03-17");
  });

  it("keeps partial text while it is being typed", async () => {
    render(<Basic />);
    await userEvent.type(field(), "2026-0");

    // Reformatting from a partial value fights the caret.
    expect(field()).toHaveValue("2026-0");
  });

  it("clears the value when the field is emptied", async () => {
    const onValueChange = vi.fn();
    render(<Basic defaultValue={d(2026, 3, 17)} onValueChange={onValueChange} />);

    await userEvent.clear(field());
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });

  it("opens the calendar from the button", async () => {
    render(<Basic />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Open calendar" }));
    expect(screen.getByRole("dialog", { name: "Choose a date" })).toBeInTheDocument();
  });

  it("opens from the keyboard with ArrowDown", async () => {
    render(<Basic />);
    field().focus();

    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("wires the trigger to the calendar it controls", async () => {
    render(<Basic />);
    const trigger = screen.getByRole("button", { name: "Open calendar" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-controls", screen.getByRole("dialog").id);
  });

  it("fills the field when a day is chosen, and closes", async () => {
    const onValueChange = vi.fn();
    render(<Basic defaultValue={d(2026, 3, 1)} onValueChange={onValueChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Open calendar" }));
    await userEvent.click(dayButton(17));

    expect(toISODate(onValueChange.mock.calls.at(-1)![0] as Date)).toBe("2026-03-17");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(field()).toHaveValue("2026-03-17");
  });

  it("returns focus to the field after choosing", async () => {
    render(<Basic defaultValue={d(2026, 3, 1)} />);

    await userEvent.click(screen.getByRole("button", { name: "Open calendar" }));
    await userEvent.click(dayButton(17));

    await waitFor(() => expect(field()).toHaveFocus());
  });

  it("closes on Escape and restores focus", async () => {
    render(<Basic />);
    await userEvent.click(screen.getByRole("button", { name: "Open calendar" }));

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(field()).toHaveFocus();
  });

  it("closes on an outside press", async () => {
    render(
      <div>
        <Basic />
        <button type="button">Outside</button>
      </div>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Open calendar" }));
    await userEvent.click(screen.getByRole("button", { name: "Outside" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("refuses a typed date outside the range", async () => {
    const onValueChange = vi.fn();
    render(<Basic min={d(2026, 3, 10)} max={d(2026, 3, 20)} onValueChange={onValueChange} />);

    await userEvent.type(field(), "2026-03-25");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("ignores an impossible date instead of rolling it over", async () => {
    const onValueChange = vi.fn();
    render(<Basic onValueChange={onValueChange} />);

    // Without the guard this becomes 2 March.
    await userEvent.type(field(), "2026-02-30");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("submits an ISO date with a form", () => {
    const { container } = render(<Basic name="starts" defaultValue={d(2026, 3, 17)} />);
    const hidden = container.querySelector<HTMLInputElement>('input[type="hidden"]');

    expect(hidden).toHaveAttribute("name", "starts");
    expect(hidden).toHaveValue("2026-03-17");
  });

  it("survives repeated open and close cycles", async () => {
    // The popover is rendered conditionally; a hook inside that branch would
    // change the hook order every time it toggles.
    render(<Basic />);
    const trigger = screen.getByRole("button", { name: "Open calendar" });

    for (let i = 0; i < 3; i++) {
      await userEvent.click(trigger);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    }
  });

  it("wires description and error", () => {
    render(<Basic description="Pick a start date." errorMessage="Required." />);

    expect(field()).toHaveAccessibleDescription("Pick a start date.");
    expect(field()).toHaveAttribute("aria-invalid", "true");
  });

  it("does nothing while disabled", async () => {
    render(<Basic disabled />);
    expect(field()).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: "Open calendar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("stays controlled when a value is supplied", async () => {
    const onValueChange = vi.fn();
    render(<Basic value={d(2026, 3, 17)} onValueChange={onValueChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Open calendar" }));
    await userEvent.click(dayButton(18));

    expect(onValueChange).toHaveBeenCalled();
    expect(field()).toHaveValue("2026-03-17");
  });
});
