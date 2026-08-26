import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Card } from "./Card";

describe("Card", () => {
  it("renders its sections", () => {
    render(
      <Card.Root>
        <Card.Header>
          <Card.Title>Deploy</Card.Title>
          <Card.Description>Ship to production.</Card.Description>
        </Card.Header>
        <Card.Body>Body content</Card.Body>
        <Card.Footer>Footer content</Card.Footer>
      </Card.Root>,
    );

    expect(screen.getByRole("heading", { name: "Deploy", level: 3 })).toBeInTheDocument();
    expect(screen.getByText("Ship to production.")).toBeInTheDocument();
    expect(screen.getByText("Body content")).toBeInTheDocument();
    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });

  it("exposes its variant for styling", () => {
    const { container } = render(<Card.Root variant="elevated">x</Card.Root>);
    expect(container.firstChild).toHaveAttribute("data-variant", "elevated");
  });

  it("becomes a real button under asChild, not a clickable div", async () => {
    const onClick = vi.fn();
    render(
      <Card.Root asChild interactive>
        <button type="button" onClick={onClick}>
          <Card.Body>Pick me</Card.Body>
        </button>
      </Card.Root>,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-interactive", "true");

    // Keyboard-operable because it is a button, not because of a handler.
    await userEvent.tab();
    expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalled();
  });

  it("forwards refs on every section", () => {
    const nodes: (HTMLElement | null)[] = [];
    render(
      <Card.Root ref={(n) => void nodes.push(n)}>
        <Card.Header ref={(n) => void nodes.push(n)}>
          <Card.Title ref={(n) => void nodes.push(n)}>T</Card.Title>
        </Card.Header>
        <Card.Body ref={(n) => void nodes.push(n)}>B</Card.Body>
      </Card.Root>,
    );

    expect(nodes.filter(Boolean)).toHaveLength(4);
  });
});
