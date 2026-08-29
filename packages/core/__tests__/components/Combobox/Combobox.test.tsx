import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { resetLayerStack } from "../../../src/primitives/DismissableLayer";
import { Combobox } from "../../../src/components/Combobox/Combobox";

afterEach(() => resetLayerStack());

const options = [
  { value: "react", label: "React" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "Solid" },
  { value: "qwik", label: "Qwik", disabled: true },
  { value: "vue", label: "Vue" },
];

const Basic = (props: Partial<React.ComponentProps<typeof Combobox>> = {}) => (
  <Combobox options={options} label="Framework" placeholder="Search" {...props} />
);

const input = () => screen.getByRole("combobox", { name: /Framework/ });

describe("Combobox", () => {
  it("keeps focus in the input while the list is open", async () => {
    render(<Basic />);
    await userEvent.click(input());

    // A combobox cannot move focus into the list — typing has to keep working.
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(input()).toHaveFocus();
  });

  it("tracks the highlight with aria-activedescendant", async () => {
    render(<Basic />);
    await userEvent.click(input());

    const active = input().getAttribute("aria-activedescendant");
    expect(active).toBeTruthy();
    expect(document.getElementById(active!)).toHaveAttribute("role", "option");
  });

  it("moves the highlight with the arrow keys without moving focus", async () => {
    render(<Basic />);
    await userEvent.click(input());

    const first = input().getAttribute("aria-activedescendant");
    await userEvent.keyboard("{ArrowDown}");

    expect(input().getAttribute("aria-activedescendant")).not.toBe(first);
    expect(input()).toHaveFocus();
  });

  it("filters as you type", async () => {
    render(<Basic />);
    await userEvent.type(input(), "sv");

    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1));
    expect(screen.getByRole("option")).toHaveTextContent("Svelte");
  });

  it("shows an empty message when nothing matches", async () => {
    render(<Basic />);
    await userEvent.type(input(), "zzz");

    expect(await screen.findByText("No results")).toBeInTheDocument();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it("selects with Enter and shows the label once closed", async () => {
    const onValueChange = vi.fn();
    render(<Basic onValueChange={onValueChange} />);

    await userEvent.type(input(), "sv");
    await userEvent.keyboard("{Enter}");

    expect(onValueChange).toHaveBeenCalledWith("svelte");
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(input()).toHaveValue("Svelte");
  });

  it("selects on click", async () => {
    const onValueChange = vi.fn();
    render(<Basic onValueChange={onValueChange} />);

    await userEvent.click(input());
    await userEvent.click(screen.getByRole("option", { name: "Solid" }));

    expect(onValueChange).toHaveBeenCalledWith("solid");
  });

  it("skips disabled options when arrowing", async () => {
    render(<Basic />);
    await userEvent.click(input());

    // Solid is index 2, Qwik (disabled) is 3, Vue is 4.
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");

    const active = input().getAttribute("aria-activedescendant");
    expect(document.getElementById(active!)).toHaveTextContent("Vue");
  });

  it("does not select a disabled option", async () => {
    const onValueChange = vi.fn();
    render(<Basic onValueChange={onValueChange} />);

    await userEvent.click(input());
    await userEvent.click(screen.getByRole("option", { name: "Qwik" }));

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("wraps the highlight at the ends", async () => {
    render(<Basic />);
    await userEvent.click(input());
    await userEvent.keyboard("{ArrowUp}");

    const active = input().getAttribute("aria-activedescendant");
    expect(document.getElementById(active!)).toHaveTextContent("Vue");
  });

  it("closes on Escape without selecting", async () => {
    const onValueChange = vi.fn();
    render(<Basic onValueChange={onValueChange} />);

    await userEvent.click(input());
    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("abandons an unconfirmed query on blur", async () => {
    render(
      <div>
        <Basic defaultValue="react" />
        <button type="button">Elsewhere</button>
      </div>,
    );

    await userEvent.type(input(), "zzz");
    await userEvent.click(screen.getByRole("button", { name: "Elsewhere" }));

    // Otherwise the field is left showing text that matches nothing selected.
    await waitFor(() => expect(input()).toHaveValue("React"));
  });

  it("clears the selection", async () => {
    const onValueChange = vi.fn();
    render(<Basic defaultValue="react" onValueChange={onValueChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(onValueChange).toHaveBeenCalledWith("");
  });

  it("has no clear button until something is selected", () => {
    render(<Basic />);
    expect(screen.queryByRole("button", { name: "Clear selection" })).not.toBeInTheDocument();
  });

  it("survives repeated open and close cycles", async () => {
    // The list is rendered conditionally; a hook called inside that branch
    // would change the hook order every time it toggles.
    render(<Basic />);

    for (let i = 0; i < 3; i++) {
      await userEvent.click(input());
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    }
  });

  it("accepts a custom filter, for server-side searching", async () => {
    const filter = vi.fn((all: typeof options) => all);
    render(<Basic filter={filter} />);

    await userEvent.type(input(), "zzz");

    expect(filter).toHaveBeenCalled();
    expect(screen.getAllByRole("option")).toHaveLength(options.length);
  });

  it("submits its value with a form", () => {
    const { container } = render(<Basic name="framework" defaultValue="vue" />);
    const hidden = container.querySelector<HTMLInputElement>('input[type="hidden"]');

    expect(hidden).toHaveAttribute("name", "framework");
    expect(hidden).toHaveValue("vue");
  });

  it("wires description and error", () => {
    render(<Basic description="Pick your stack." errorMessage="Required." />);

    expect(input()).toHaveAccessibleDescription("Pick your stack.");
    expect(input()).toHaveAttribute("aria-invalid", "true");
  });

  it("does nothing while disabled", async () => {
    render(<Basic disabled />);
    await userEvent.click(input());
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
