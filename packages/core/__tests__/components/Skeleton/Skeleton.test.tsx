import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "../../../src/components/Skeleton/Skeleton";

describe("Skeleton", () => {
  it("is hidden from assistive tech", () => {
    // A screen reader announcing a row of empty boxes tells nobody anything;
    // the busy state belongs on the region that is loading.
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("takes an explicit size", () => {
    const { container } = render(<Skeleton width={200} height={16} />);
    expect(container.firstChild).toHaveStyle({ width: "200px", height: "16px" });
  });

  it("renders a stack of lines for text", () => {
    const { container } = render(<Skeleton variant="text" lines={3} />);
    expect(container.firstChild!.childNodes).toHaveLength(3);
  });

  it("makes the last line short so a stack reads as a paragraph", () => {
    const { container } = render(<Skeleton variant="text" lines={3} />);
    const lines = Array.from(container.firstChild!.childNodes) as HTMLElement[];

    expect(lines.at(-1)).toHaveStyle({ width: "60%" });
    expect(lines[0]).toHaveStyle({ width: "100%" });
  });

  it("can turn its animation off", () => {
    const { container } = render(<Skeleton animation="none" />);
    expect((container.firstChild as HTMLElement).className).not.toMatch(/pulse|wave/);
  });

  it("stays hidden even as a multi-line stack", () => {
    const { container } = render(<Skeleton variant="text" lines={2} />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByText(/./)).not.toBeInTheDocument();
  });
});
