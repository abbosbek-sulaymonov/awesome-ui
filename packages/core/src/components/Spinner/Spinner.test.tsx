import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("announces itself as a status by default", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading");
  });

  it("accepts a custom label", () => {
    render(<Spinner label="Fetching results" />);
    expect(screen.getByRole("status")).toHaveTextContent("Fetching results");
  });

  it("goes silent when the label is null", () => {
    const { container } = render(<Spinner label={null} />);

    // Decorative: a surrounding element already owns the announcement, so
    // this must not add a second one.
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("exposes its size for styling", () => {
    render(<Spinner size="lg" />);
    expect(screen.getByRole("status")).toHaveAttribute("data-size", "lg");
  });

  it("merges className", () => {
    render(<Spinner className="custom" />);
    const node = screen.getByRole("status");
    expect(node.className).toContain("custom");
    expect(node.className.split(" ").length).toBeGreaterThan(1);
  });
});
