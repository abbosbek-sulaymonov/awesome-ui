import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Separator } from "../../../src/components/Separator/Separator";

describe("Separator", () => {
  it("is a separator by default", () => {
    render(<Separator />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("leaves the accessibility tree when decorative", () => {
    // A rule that divides nothing should not be announced as dividing something.
    const { container } = render(<Separator decorative />);
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
    expect(container.firstChild).toHaveAttribute("role", "none");
  });

  it("states its orientation only when it is not the default", () => {
    const { rerender, container } = render(<Separator />);
    // horizontal is implicit for role="separator".
    expect(container.firstChild).not.toHaveAttribute("aria-orientation");

    rerender(<Separator orientation="vertical" />);
    expect(container.firstChild).toHaveAttribute("aria-orientation", "vertical");
  });

  it("renders a label inside the rule", () => {
    render(<Separator label="or" />);
    expect(screen.getByText("or")).toBeInTheDocument();
  });

  it("ignores a label when vertical, where there is no gap for it", () => {
    render(<Separator orientation="vertical" label="or" />);
    expect(screen.queryByText("or")).not.toBeInTheDocument();
  });
});
