import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Accordion } from "../../../src/components/Accordion/Accordion";

function Basic(props: Partial<React.ComponentProps<typeof Accordion.Root>> = {}) {
  return (
    <Accordion.Root {...(props as React.ComponentProps<typeof Accordion.Root>)}>
      <Accordion.Item value="one">
        <Accordion.Trigger>First</Accordion.Trigger>
        <Accordion.Panel>First panel</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="two">
        <Accordion.Trigger>Second</Accordion.Trigger>
        <Accordion.Panel>Second panel</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="three" disabled>
        <Accordion.Trigger>Third</Accordion.Trigger>
        <Accordion.Panel>Third panel</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="four">
        <Accordion.Trigger>Fourth</Accordion.Trigger>
        <Accordion.Panel>Fourth panel</Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  );
}

describe("Accordion", () => {
  it("starts closed and opens on click", async () => {
    render(<Basic />);
    expect(screen.queryByText("First panel")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "First" }));

    expect(screen.getByText("First panel")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "First" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("puts each trigger inside a heading", () => {
    render(<Basic />);
    // Without a heading wrapper, assistive tech cannot navigate the accordion
    // as a document outline.
    expect(screen.getByRole("heading", { name: "First", level: 3 })).toBeInTheDocument();
  });

  it("respects a custom heading level", () => {
    render(
      <Accordion.Root>
        <Accordion.Item value="one">
          <Accordion.Trigger headingLevel={2}>First</Accordion.Trigger>
          <Accordion.Panel>Body</Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>,
    );
    expect(screen.getByRole("heading", { name: "First", level: 2 })).toBeInTheDocument();
  });

  it("wires each trigger to its panel", async () => {
    render(<Basic defaultValue="one" />);
    const trigger = screen.getByRole("button", { name: "First" });
    const panel = screen.getByRole("region");

    expect(trigger).toHaveAttribute("aria-controls", panel.id);
    expect(panel).toHaveAttribute("aria-labelledby", trigger.id);
  });

  it("keeps only one panel open in single mode", async () => {
    render(<Basic defaultValue="one" />);
    expect(screen.getByText("First panel")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Second" }));

    expect(screen.getByText("Second panel")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("First panel")).not.toBeInTheDocument());
  });

  it("closes the open panel when collapsible", async () => {
    render(<Basic defaultValue="one" />);

    await userEvent.click(screen.getByRole("button", { name: "First" }));
    await waitFor(() => expect(screen.queryByText("First panel")).not.toBeInTheDocument());
  });

  it("refuses to close the last panel when not collapsible", async () => {
    render(<Basic defaultValue="one" collapsible={false} />);

    await userEvent.click(screen.getByRole("button", { name: "First" }));

    // Nothing left to read would be worse than a stuck-open panel.
    expect(screen.getByText("First panel")).toBeInTheDocument();
  });

  it("holds several panels open in multiple mode", async () => {
    render(<Basic type="multiple" defaultValue={["one"]} />);

    await userEvent.click(screen.getByRole("button", { name: "Second" }));

    expect(screen.getByText("First panel")).toBeInTheDocument();
    expect(screen.getByText("Second panel")).toBeInTheDocument();
  });

  it("reports a string in single mode and an array in multiple", async () => {
    const onSingle = vi.fn();
    const { unmount } = render(<Basic onValueChange={onSingle} />);
    await userEvent.click(screen.getByRole("button", { name: "Second" }));
    expect(onSingle).toHaveBeenCalledWith("two");
    unmount();

    const onMultiple = vi.fn();
    render(<Basic type="multiple" onValueChange={onMultiple} />);
    await userEvent.click(screen.getByRole("button", { name: "Second" }));
    expect(onMultiple).toHaveBeenCalledWith(["two"]);
  });

  it("moves between triggers with arrow keys, skipping disabled ones", async () => {
    render(<Basic />);
    screen.getByRole("button", { name: "Second" }).focus();

    await userEvent.keyboard("{ArrowDown}");
    // Third is disabled and must be stepped over.
    expect(screen.getByRole("button", { name: "Fourth" })).toHaveFocus();
  });

  it("wraps at the ends", async () => {
    render(<Basic />);
    screen.getByRole("button", { name: "First" }).focus();

    await userEvent.keyboard("{ArrowUp}");
    expect(screen.getByRole("button", { name: "Fourth" })).toHaveFocus();
  });

  it("disables a disabled item's trigger", () => {
    render(<Basic />);
    expect(screen.getByRole("button", { name: "Third" })).toBeDisabled();
  });

  it("disables every trigger when the root is disabled", () => {
    render(<Basic disabled />);
    for (const button of screen.getAllByRole("button")) {
      expect(button).toBeDisabled();
    }
  });

  it("does not leak its own props onto the root element", () => {
    const { container } = render(<Basic type="multiple" defaultValue={["one"]} />);
    const root = container.firstElementChild!;

    // These are the component's API, not DOM attributes; spreading them would
    // put a literal value="..." on a div and make React warn about
    // onValueChange.
    expect(root.getAttribute("value")).toBeNull();
    expect(root.getAttribute("type")).toBeNull();
    expect(root.getAttribute("defaultValue")).toBeNull();
  });

  it("stays controlled when a value is supplied", async () => {
    const onValueChange = vi.fn();
    render(<Basic value="one" onValueChange={onValueChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Second" }));

    expect(onValueChange).toHaveBeenCalledWith("two");
    expect(screen.getByText("First panel")).toBeInTheDocument();
  });
});
