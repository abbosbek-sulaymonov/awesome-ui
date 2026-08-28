import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Toggle } from "../../../src/components/Toggle/Toggle";
import { ToggleGroup } from "../../../src/components/ToggleGroup/ToggleGroup";

describe("Toggle", () => {
  it("reports pressed state rather than switch state", () => {
    render(<Toggle>Bold</Toggle>);

    // A toggle applies a state to something else; a switch is the setting.
    // Screen readers say "pressed" for one and "on" for the other.
    const button = screen.getByRole("button", { name: "Bold" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
  });

  it("toggles on click", async () => {
    render(<Toggle>Bold</Toggle>);
    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("reports each change exactly once", async () => {
    const onPressedChange = vi.fn();
    render(<Toggle onPressedChange={onPressedChange}>Bold</Toggle>);

    await userEvent.click(screen.getByRole("button"));
    expect(onPressedChange).toHaveBeenCalledTimes(1);
    expect(onPressedChange).toHaveBeenCalledWith(true);
  });

  it("stays controlled when pressed is supplied", async () => {
    const onPressedChange = vi.fn();
    render(<Toggle pressed={false} onPressedChange={onPressedChange}>Bold</Toggle>);

    await userEvent.click(screen.getByRole("button"));
    expect(onPressedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
  });

  it("cannot be toggled while disabled", async () => {
    const onPressedChange = vi.fn();
    render(<Toggle disabled onPressedChange={onPressedChange}>Bold</Toggle>);

    await userEvent.click(screen.getByRole("button"));
    expect(onPressedChange).not.toHaveBeenCalled();
  });
});

describe("ToggleGroup", () => {
  type GroupProps = Partial<React.ComponentProps<typeof ToggleGroup>>;

  const Group = (props: GroupProps = {}) => (
    <ToggleGroup label="Alignment" {...(props as React.ComponentProps<typeof ToggleGroup>)}>
      <Toggle value="left">Left</Toggle>
      <Toggle value="center">Center</Toggle>
      <Toggle value="right">Right</Toggle>
    </ToggleGroup>
  );

  it("names the group", () => {
    render(<Group />);
    expect(screen.getByRole("group", { name: "Alignment" })).toBeInTheDocument();
  });

  it("keeps one selection in single mode", async () => {
    const onValueChange = vi.fn();
    render(<Group defaultValue="left" onValueChange={onValueChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Center" }));

    expect(screen.getByRole("button", { name: "Center" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Left" })).toHaveAttribute("aria-pressed", "false");
    expect(onValueChange).toHaveBeenLastCalledWith("center");
  });

  it("clears the selection when collapsible", async () => {
    const onValueChange = vi.fn();
    render(<Group defaultValue="left" onValueChange={onValueChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Left" }));
    expect(onValueChange).toHaveBeenLastCalledWith("");
  });

  it("refuses to clear the last selection when not collapsible", async () => {
    render(<Group defaultValue="left" collapsible={false} />);

    await userEvent.click(screen.getByRole("button", { name: "Left" }));
    expect(screen.getByRole("button", { name: "Left" })).toHaveAttribute("aria-pressed", "true");
  });

  it("holds several selections in multiple mode", async () => {
    const onValueChange = vi.fn();
    render(<Group type="multiple" defaultValue={["left"]} onValueChange={onValueChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Right" }));

    expect(onValueChange).toHaveBeenLastCalledWith(["left", "right"]);
    expect(screen.getByRole("button", { name: "Left" })).toHaveAttribute("aria-pressed", "true");
  });

  it("reports a string in single mode and an array in multiple", async () => {
    const single = vi.fn();
    const { unmount } = render(<Group onValueChange={single} />);
    await userEvent.click(screen.getByRole("button", { name: "Left" }));
    expect(single).toHaveBeenLastCalledWith("left");
    unmount();

    const multiple = vi.fn();
    render(<Group type="multiple" onValueChange={multiple} />);
    await userEvent.click(screen.getByRole("button", { name: "Left" }));
    expect(multiple).toHaveBeenLastCalledWith(["left"]);
  });

  it("moves between buttons with arrow keys", async () => {
    render(<Group />);
    screen.getByRole("button", { name: "Left" }).focus();

    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Center" })).toHaveFocus();
  });

  it("does not leak its own props onto the DOM node", () => {
    const { container } = render(<Group defaultValue="left" collapsible={false} />);
    const root = container.firstElementChild!;

    expect(root.getAttribute("type")).toBeNull();
    expect(root.getAttribute("value")).toBeNull();
    expect(root.getAttribute("collapsible")).toBeNull();
  });
});
