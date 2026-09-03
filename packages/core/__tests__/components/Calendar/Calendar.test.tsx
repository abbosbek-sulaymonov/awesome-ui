import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Calendar } from "../../../src/components/Calendar/Calendar";
import { formatFullDate, toISODate } from "../../../src/utils/date";

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);
const march = d(2026, 3, 1);

// Pinned so the assertions do not depend on the runner's default locale —
// en-US formats a full date as "Tuesday, March 17, 2026" and en-GB as
// "Tuesday, 17 March 2026", and a test that flips between them is flaky by
// construction.
const LOCALE = "en-GB";

/**
 * Matches on the exact accessible name.
 *
 * A loose regex is wrong here: /9 March 2026/ also matches the 19th and the
 * 29th, so half these assertions were silently ambiguous.
 */
const dayButton = (day: number, monthOffset = 0) =>
  screen.getByRole("button", {
    name: formatFullDate(d(2026, 3 + monthOffset, day), LOCALE),
  });

describe("Calendar", () => {
  it("renders a real grid, not a pile of buttons", () => {
    render(<Calendar defaultMonth={march} locale={LOCALE} />);
    // A grid of buttons in divs loses the row and column relationships, so a
    // screen reader can no longer say which weekday a day belongs to.
    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")).toHaveLength(7);
  });

  it("always renders six weeks", () => {
    const { rerender } = render(<Calendar defaultMonth={d(2026, 2, 1)} locale={LOCALE} />);
    // A grid that changes height makes everything below it jump as you page.
    expect(screen.getAllByRole("row")).toHaveLength(7); // header + 6

    rerender(<Calendar defaultMonth={d(2026, 8, 1)} locale={LOCALE} />);
    expect(screen.getAllByRole("row")).toHaveLength(7);
  });

  it("names each day rather than leaving a bare number", () => {
    render(<Calendar defaultMonth={march} locale={LOCALE} />);
    // "17" says nothing on its own.
    expect(dayButton(17)).toBeInTheDocument();
  });

  it("shows the month and year", () => {
    render(<Calendar defaultMonth={march} locale={LOCALE} />);
    expect(screen.getByText(/March 2026/)).toBeInTheDocument();
  });

  it("selects a day", async () => {
    const onValueChange = vi.fn();
    render(<Calendar defaultMonth={march} onValueChange={onValueChange} locale={LOCALE} />);

    await userEvent.click(dayButton(17));

    expect(toISODate(onValueChange.mock.calls[0]![0] as Date)).toBe("2026-03-17");
    expect(dayButton(17)).toHaveAttribute("aria-selected", "true");
  });

  it("keeps one tab stop for the whole grid", () => {
    render(<Calendar defaultMonth={march} defaultValue={d(2026, 3, 17)} locale={LOCALE} />);
    const tabbable = screen
      .getAllByRole("button")
      .filter((b) => b.getAttribute("tabindex") === "0" && b.hasAttribute("data-day"));

    // 42 tab stops per month would be unusable.
    expect(tabbable).toHaveLength(1);
  });

  it("moves a day at a time with the arrow keys", async () => {
    render(<Calendar defaultMonth={march} defaultValue={d(2026, 3, 17)} locale={LOCALE} />);
    dayButton(17).focus();

    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(dayButton(18)).toHaveFocus());

    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(dayButton(25)).toHaveFocus());
  });

  it("navigates without selecting", async () => {
    const onValueChange = vi.fn();
    render(<Calendar defaultMonth={march} defaultValue={d(2026, 3, 17)} onValueChange={onValueChange} locale={LOCALE} />);

    dayButton(17).focus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");

    // A keyboard user has to be able to look before committing.
    expect(onValueChange).not.toHaveBeenCalled();
    expect(dayButton(17)).toHaveAttribute("aria-selected", "true");
  });

  it("follows the focus into the next month", async () => {
    render(<Calendar defaultMonth={march} defaultValue={d(2026, 3, 31)} locale={LOCALE} />);
    dayButton(31).focus();

    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(screen.getByText(/April 2026/)).toBeInTheDocument());
  });

  it("jumps to the ends of the month with Home and End", async () => {
    render(<Calendar defaultMonth={march} defaultValue={d(2026, 3, 17)} locale={LOCALE} />);
    dayButton(17).focus();

    await userEvent.keyboard("{Home}");
    await waitFor(() => expect(dayButton(1)).toHaveFocus());

    await userEvent.keyboard("{End}");
    await waitFor(() => expect(dayButton(31)).toHaveFocus());
  });

  it("pages a month with PageUp and PageDown", async () => {
    render(<Calendar defaultMonth={march} defaultValue={d(2026, 3, 17)} locale={LOCALE} />);
    dayButton(17).focus();

    await userEvent.keyboard("{PageDown}");
    await waitFor(() => expect(screen.getByText(/April 2026/)).toBeInTheDocument());
  });

  it("pages a year with Shift and PageUp", async () => {
    render(<Calendar defaultMonth={march} defaultValue={d(2026, 3, 17)} locale={LOCALE} />);
    dayButton(17).focus();

    await userEvent.keyboard("{Shift>}{PageUp}{/Shift}");
    await waitFor(() => expect(screen.getByText(/March 2025/)).toBeInTheDocument());
  });

  it("moves between months with the header buttons", async () => {
    render(<Calendar defaultMonth={march} locale={LOCALE} />);

    await userEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByText(/April 2026/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Previous month" }));
    expect(screen.getByText(/March 2026/)).toBeInTheDocument();
  });

  it("disables days outside the range", () => {
    render(<Calendar defaultMonth={march} min={d(2026, 3, 10)} max={d(2026, 3, 20)} locale={LOCALE} />);

    expect(dayButton(9)).toBeDisabled();
    expect(dayButton(10)).toBeEnabled();
    expect(dayButton(21)).toBeDisabled();
  });

  it("stops paging past the bounds", () => {
    render(<Calendar defaultMonth={march} min={d(2026, 3, 1)} max={d(2026, 3, 31)} locale={LOCALE} />);

    expect(screen.getByRole("button", { name: "Previous month" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next month" })).toBeDisabled();
  });

  it("rejects individual days", () => {
    // Weekends, holidays, taken slots.
    render(
      <Calendar
        defaultMonth={march}
        isDateDisabled={(date) => date.getDay() === 0}
        locale={LOCALE}
      />,
    );
    expect(dayButton(1)).toBeDisabled(); // a Sunday
    expect(dayButton(2)).toBeEnabled();
  });

  it("does not select a disabled day", async () => {
    const onValueChange = vi.fn();
    render(<Calendar defaultMonth={march} min={d(2026, 3, 10)} onValueChange={onValueChange} locale={LOCALE} />);

    await userEvent.click(dayButton(5));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("marks today", () => {
    render(<Calendar locale={LOCALE} />);
    expect(screen.getByRole("button", { current: "date" })).toBeInTheDocument();
  });

  it("honours where the week starts", () => {
    const { rerender } = render(<Calendar defaultMonth={march} weekStartsOn={1} locale={LOCALE} />);
    expect(screen.getAllByRole("columnheader")[0]).toHaveAttribute("abbr", expect.stringMatching(/^Mon/));

    rerender(<Calendar defaultMonth={march} weekStartsOn={0} locale={LOCALE} />);
    expect(screen.getAllByRole("columnheader")[0]).toHaveAttribute("abbr", expect.stringMatching(/^Sun/));
  });

  it("announces a month change", () => {
    render(<Calendar defaultMonth={march} locale={LOCALE} />);
    // A silent change leaves a screen-reader user reading days from a month
    // they cannot see.
    expect(screen.getByText(/March 2026/)).toHaveAttribute("aria-live", "polite");
  });

  it("stays controlled when a value is supplied", async () => {
    const onValueChange = vi.fn();
    render(<Calendar defaultMonth={march} value={d(2026, 3, 17)} onValueChange={onValueChange} locale={LOCALE} />);

    await userEvent.click(dayButton(18));

    expect(onValueChange).toHaveBeenCalled();
    expect(dayButton(17)).toHaveAttribute("aria-selected", "true");
  });
});
