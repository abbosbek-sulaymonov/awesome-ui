import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { resetLayerStack } from "../../../src/primitives/DismissableLayer";
import { Drawer } from "../../../src/components/Drawer/Drawer";

afterEach(() => resetLayerStack());

const Basic = (props: React.ComponentProps<typeof Drawer.Root> = {}) => (
  <div>
    <button type="button">Outside</button>
    <Drawer.Root {...props}>
      <Drawer.Trigger>Open</Drawer.Trigger>
      <Drawer.Overlay />
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Filters</Drawer.Title>
          <Drawer.Description>Narrow the results.</Drawer.Description>
        </Drawer.Header>
        <Drawer.Body>
          <input aria-label="Search" />
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close>Done</Drawer.Close>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer.Root>
  </div>
);

const trigger = () => screen.getByRole("button", { name: "Open" });

describe("Drawer", () => {
  it("opens from the trigger", async () => {
    render(<Basic />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.click(trigger());
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("names and describes itself from Title and Description", async () => {
    render(<Basic />);
    await userEvent.click(trigger());

    const drawer = screen.getByRole("dialog");
    expect(drawer).toHaveAccessibleName("Filters");
    expect(drawer).toHaveAccessibleDescription("Narrow the results.");
    expect(drawer).toHaveAttribute("aria-modal", "true");
  });

  it("omits aria-labelledby when no Title is rendered", async () => {
    render(
      <Drawer.Root>
        <Drawer.Trigger>Open</Drawer.Trigger>
        <Drawer.Content aria-label="Bare">Body</Drawer.Content>
      </Drawer.Root>,
    );
    await userEvent.click(trigger());

    const drawer = screen.getByRole("dialog");
    expect(drawer).not.toHaveAttribute("aria-labelledby");
    expect(drawer).toHaveAccessibleName("Bare");
  });

  it("exposes the side it slides from", async () => {
    render(<Basic side="left" />);
    await userEvent.click(trigger());
    expect(screen.getByRole("dialog")).toHaveAttribute("data-side", "left");
  });

  it("moves focus in and returns it to the trigger", async () => {
    render(<Basic />);
    await userEvent.click(trigger());

    await waitFor(() =>
      expect(screen.getByRole("dialog")).toContainElement(document.activeElement as HTMLElement),
    );

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(trigger()).toHaveFocus());
  });

  it("cycles focus with Tab instead of escaping to the page", async () => {
    render(<Basic />);
    await userEvent.click(trigger());
    const drawer = await screen.findByRole("dialog");

    for (let i = 0; i < 6; i++) {
      await userEvent.tab();
      expect(drawer).toContainElement(document.activeElement as HTMLElement);
    }
  });

  it("closes on an outside press", async () => {
    render(<Basic />);
    await userEvent.click(trigger());

    await userEvent.click(screen.getByRole("button", { name: "Outside" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("ignores outside presses when told to", async () => {
    render(<Basic dismissOnOutsideClick={false} />);
    await userEvent.click(trigger());

    await userEvent.click(screen.getByRole("button", { name: "Outside" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes from Drawer.Close", async () => {
    render(<Basic />);
    await userEvent.click(trigger());

    await userEvent.click(screen.getByRole("button", { name: "Done" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("locks background scrolling while open", async () => {
    render(<Basic />);
    await userEvent.click(trigger());
    expect(document.body.style.overflow).toBe("hidden");

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(document.body.style.overflow).not.toBe("hidden"));
  });

  it("reports open changes", async () => {
    const onOpenChange = vi.fn();
    render(<Basic onOpenChange={onOpenChange} />);

    await userEvent.click(trigger());
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
  });
});
