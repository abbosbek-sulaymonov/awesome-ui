import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../../../src/components/Button/Button";

describe("Button", () => {
  it("renders a button with type=button by default", () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("type", "button");
  });

  it("forwards arbitrary props and data attributes to the root", () => {
    render(
      <Button data-testid="cta" aria-keyshortcuts="Meta+S">
        Save
      </Button>,
    );
    expect(screen.getByTestId("cta")).toHaveAttribute("aria-keyshortcuts", "Meta+S");
  });

  it("merges className instead of replacing it", () => {
    render(<Button className="custom">Save</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("custom");
    expect(button.className.split(" ").length).toBeGreaterThan(1);
  });

  it("exposes variant and size as data attributes", () => {
    render(
      <Button variant="danger" size="lg">
        Delete
      </Button>,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-variant", "danger");
    expect(button).toHaveAttribute("data-size", "lg");
  });

  it("blocks clicks and announces busy while loading", async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Loading")).toBeInTheDocument();

    await userEvent.click(button, { pointerEventsCheck: 0 });
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders its child instead of a button when asChild is set", () => {
    render(
      <Button asChild variant="ghost">
        <a href="/docs">Docs</a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/docs");
    expect(link).toHaveAttribute("data-variant", "ghost");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("runs both its own and the child's handler under asChild", async () => {
    const childClick = vi.fn();
    const slotClick = vi.fn();

    render(
      <Button asChild onClick={slotClick}>
        <a href="#x" onClick={childClick}>
          Go
        </a>
      </Button>,
    );

    await userEvent.click(screen.getByRole("link"));
    expect(childClick).toHaveBeenCalledOnce();
    expect(slotClick).toHaveBeenCalledOnce();
  });

  it("forwards the ref to the underlying element", () => {
    let node: HTMLButtonElement | null = null;
    render(<Button ref={(element) => void (node = element)}>Save</Button>);
    expect(node).toBeInstanceOf(HTMLButtonElement);
  });

  it("hides decorative icons from assistive tech", () => {
    render(
      <Button startIcon={<svg data-testid="icon" />}>Save</Button>,
    );
    expect(screen.getByTestId("icon").parentElement).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("button")).toHaveAccessibleName("Save");
  });
});
