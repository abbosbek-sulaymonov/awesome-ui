import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders its content", () => {
    render(<Badge>Beta</Badge>);
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("exposes variant and tone as data attributes", () => {
    render(<Badge variant="solid" tone="danger">Failed</Badge>);
    const badge = screen.getByText("Failed");

    expect(badge).toHaveAttribute("data-variant", "solid");
    expect(badge).toHaveAttribute("data-tone", "danger");
  });

  it("adds screen-reader-only text without changing the visible label", () => {
    render(<Badge srLabel="3 unread messages">3</Badge>);

    // Colour and abbreviation carry meaning visually; srLabel carries it to
    // assistive tech without duplicating it on screen.
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("3 unread messages")).toBeInTheDocument();
  });

  it("hides the status dot from assistive tech", () => {
    const { container } = render(<Badge dot>Live</Badge>);
    expect(container.querySelector("[aria-hidden='true']")).toBeInTheDocument();
  });

  it("renders its child under asChild", () => {
    render(
      <Badge asChild tone="accent">
        <a href="/releases">v2.0</a>
      </Badge>,
    );

    const link = screen.getByRole("link", { name: "v2.0" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("data-tone", "accent");
  });
});
