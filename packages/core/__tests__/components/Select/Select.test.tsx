import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { resetLayerStack } from "../../../src/primitives/DismissableLayer";
import { Select } from "../../../src/components/Select/Select";

afterEach(() => resetLayerStack());

function Basic(props: React.ComponentProps<typeof Select.Root> = {}) {
  return (
    <Select.Root {...props}>
      <Select.Trigger label="Framework">
        <Select.Value placeholder="Pick one" />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="react">React</Select.Item>
        <Select.Item value="svelte">Svelte</Select.Item>
        <Select.Item value="solid">Solid</Select.Item>
        <Select.Item value="qwik" disabled>
          Qwik
        </Select.Item>
        <Select.Item value="vue">Vue</Select.Item>
      </Select.Content>
    </Select.Root>
  );
}

const trigger = () => screen.getByRole("combobox", { name: /Framework/ });

describe("Select", () => {
  it("is a combobox that controls a listbox", async () => {
    render(<Basic />);

    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    await userEvent.click(trigger());

    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(trigger()).toHaveAttribute("aria-controls", screen.getByRole("listbox").id);
  });

  it("shows the placeholder until something is chosen", async () => {
    render(<Basic />);
    expect(screen.getByText("Pick one")).toBeInTheDocument();

    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole("option", { name: "Svelte" }));

    await waitFor(() => expect(screen.queryByText("Pick one")).not.toBeInTheDocument());
    expect(trigger()).toHaveTextContent("Svelte");
  });

  it("reports the chosen value", async () => {
    const onValueChange = vi.fn();
    render(<Basic onValueChange={onValueChange} />);

    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole("option", { name: "Solid" }));

    expect(onValueChange).toHaveBeenCalledWith("solid");
  });

  it("marks the chosen option as selected", async () => {
    render(<Basic defaultValue="svelte" />);
    await userEvent.click(trigger());

    expect(screen.getByRole("option", { name: "Svelte" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("option", { name: "React" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("opens with the selected option focused", async () => {
    render(<Basic defaultValue="solid" />);
    await userEvent.click(trigger());

    // A native select never opens with nothing highlighted.
    await waitFor(() =>
      expect(screen.getByRole("option", { name: "Solid" })).toHaveFocus(),
    );
  });

  it("opens with the first option focused when nothing is selected", async () => {
    render(<Basic />);
    await userEvent.click(trigger());

    await waitFor(() => expect(screen.getByRole("option", { name: "React" })).toHaveFocus());
  });

  it("opens from the keyboard with ArrowDown", async () => {
    render(<Basic />);
    await userEvent.tab();
    expect(trigger()).toHaveFocus();

    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("moves through options with the arrow keys", async () => {
    render(<Basic />);
    await userEvent.click(trigger());
    await waitFor(() => expect(screen.getByRole("option", { name: "React" })).toHaveFocus());

    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: "Svelte" })).toHaveFocus();

    await userEvent.keyboard("{ArrowUp}");
    expect(screen.getByRole("option", { name: "React" })).toHaveFocus();
  });

  it("skips disabled options entirely", async () => {
    render(<Basic defaultValue="solid" />);
    await userEvent.click(trigger());
    await waitFor(() => expect(screen.getByRole("option", { name: "Solid" })).toHaveFocus());

    // Qwik sits between Solid and Vue and must be stepped over, not landed on.
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: "Vue" })).toHaveFocus();
  });

  it("jumps to the ends with Home and End", async () => {
    render(<Basic />);
    await userEvent.click(trigger());
    await waitFor(() => expect(screen.getByRole("option", { name: "React" })).toHaveFocus());

    await userEvent.keyboard("{End}");
    expect(screen.getByRole("option", { name: "Vue" })).toHaveFocus();

    await userEvent.keyboard("{Home}");
    expect(screen.getByRole("option", { name: "React" })).toHaveFocus();
  });

  it("wraps around at the ends", async () => {
    render(<Basic />);
    await userEvent.click(trigger());
    await waitFor(() => expect(screen.getByRole("option", { name: "React" })).toHaveFocus());

    await userEvent.keyboard("{ArrowUp}");
    expect(screen.getByRole("option", { name: "Vue" })).toHaveFocus();
  });

  it("selects the focused option with Enter", async () => {
    const onValueChange = vi.fn();
    render(<Basic onValueChange={onValueChange} />);

    await userEvent.click(trigger());
    await waitFor(() => expect(screen.getByRole("option", { name: "React" })).toHaveFocus());

    await userEvent.keyboard("{ArrowDown}{Enter}");

    expect(onValueChange).toHaveBeenCalledWith("svelte");
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
  });

  it("returns focus to the trigger after choosing", async () => {
    render(<Basic />);
    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole("option", { name: "Vue" }));

    await waitFor(() => expect(trigger()).toHaveFocus());
  });

  it("jumps to an option by typing", async () => {
    render(<Basic />);
    await userEvent.click(trigger());
    await waitFor(() => expect(screen.getByRole("option", { name: "React" })).toHaveFocus());

    await userEvent.keyboard("sv");
    expect(screen.getByRole("option", { name: "Svelte" })).toHaveFocus();
  });

  it("cycles through matches when the same letter is repeated", async () => {
    render(<Basic />);
    await userEvent.click(trigger());
    await waitFor(() => expect(screen.getByRole("option", { name: "React" })).toHaveFocus());

    // "s" matches both Svelte and Solid; pressing it twice must advance rather
    // than search for "ss".
    await userEvent.keyboard("s");
    expect(screen.getByRole("option", { name: "Svelte" })).toHaveFocus();

    await userEvent.keyboard("s");
    expect(screen.getByRole("option", { name: "Solid" })).toHaveFocus();
  });

  it("closes on Escape and restores focus", async () => {
    render(<Basic />);
    await userEvent.click(trigger());
    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(trigger()).toHaveFocus();
  });

  it("closes on an outside press", async () => {
    render(
      <div>
        <button type="button">Outside</button>
        <Basic />
      </div>,
    );

    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole("button", { name: "Outside" }));

    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
  });

  it("does nothing when disabled", async () => {
    render(<Basic disabled />);
    expect(trigger()).toBeDisabled();

    await userEvent.click(trigger());
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("stays controlled when a value is supplied", async () => {
    const onValueChange = vi.fn();
    render(<Basic value="react" onValueChange={onValueChange} />);

    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole("option", { name: "Vue" }));

    expect(onValueChange).toHaveBeenCalledWith("vue");
    expect(trigger()).toHaveTextContent("React");
  });

  it("submits its value with the surrounding form", async () => {
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      expect(new FormData(event.currentTarget).get("framework")).toBe("svelte");
    });

    render(
      <form onSubmit={onSubmit}>
        <Basic name="framework" defaultValue="svelte" />
        <button type="submit">Submit</button>
      </form>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("wires description and error onto the trigger", () => {
    render(
      <Select.Root>
        <Select.Trigger
          label="Framework"
          description="Pick your stack."
          errorMessage="Required."
        >
          <Select.Value placeholder="Pick one" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="react">React</Select.Item>
        </Select.Content>
      </Select.Root>,
    );

    expect(trigger()).toHaveAccessibleDescription("Pick your stack.");
    expect(trigger()).toHaveAttribute("aria-invalid", "true");
  });
});
