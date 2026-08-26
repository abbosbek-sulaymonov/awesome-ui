import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Alert } from "../../../src/components/Alert/Alert";

describe("Alert", () => {
  it("renders its title and body", () => {
    render(<Alert title="Heads up">Something happened.</Alert>);

    expect(screen.getByText("Heads up")).toBeInTheDocument();
    expect(screen.getByText("Something happened.")).toBeInTheDocument();
  });

  it("is not a live region by default", () => {
    render(<Alert title="Heads up">Body</Alert>);

    // An alert rendered with the page is part of the page. role="alert" on
    // mount interrupts a screen reader to announce something the user has not
    // navigated to yet.
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("announces politely when asked to be live", () => {
    render(<Alert live tone="info" title="Saved" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("interrupts for a live danger alert", () => {
    render(<Alert live tone="danger" title="Failed" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("exposes its tone for styling", () => {
    const { container } = render(<Alert tone="warning" title="Careful" />);
    expect(container.firstChild).toHaveAttribute("data-tone", "warning");
  });

  it("hides the decorative icon from assistive tech", () => {
    const { container } = render(<Alert title="Heads up" />);
    expect(container.querySelector("[aria-hidden='true']")).toBeInTheDocument();
  });

  it("can render without an icon", () => {
    const { container } = render(<Alert icon={null} title="Heads up" />);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("dismisses when asked", async () => {
    const onDismiss = vi.fn();
    render(<Alert title="Heads up" onDismiss={onDismiss} />);

    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("has no close button without a dismiss handler", () => {
    render(<Alert title="Heads up" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders actions", () => {
    render(<Alert title="Heads up" actions={<button type="button">Retry</button>} />);
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});
