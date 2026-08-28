import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Breadcrumb } from "../../../src/components/Breadcrumb/Breadcrumb";

const Trail = () => (
  <Breadcrumb.Root>
    <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
    <Breadcrumb.Link href="/docs">Docs</Breadcrumb.Link>
    <Breadcrumb.Link current>Button</Breadcrumb.Link>
  </Breadcrumb.Root>
);

describe("Breadcrumb", () => {
  it("is a named navigation landmark", () => {
    render(<Trail />);
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
  });

  it("renders the trail as a list", () => {
    render(<Trail />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("does not make the current page a link", () => {
    render(<Trail />);

    // The current page goes nowhere. A link there gives a keyboard user a stop
    // that does nothing when activated.
    expect(screen.getAllByRole("link")).toHaveLength(2);
    expect(screen.getByText("Button")).toHaveAttribute("aria-current", "page");
  });

  it("hides separators from assistive tech", () => {
    render(<Trail />);
    // Otherwise a screen reader reads "slash" between every step.
    expect(screen.queryByText("/", { ignore: "[aria-hidden='true']" })).not.toBeInTheDocument();
  });

  it("accepts a custom separator", () => {
    render(
      <Breadcrumb.Root separator="›">
        <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
        <Breadcrumb.Link current>Here</Breadcrumb.Link>
      </Breadcrumb.Root>,
    );
    expect(screen.getByText("›")).toHaveAttribute("aria-hidden", "true");
  });

  it("announces an ellipsis as hidden pages", () => {
    render(
      <Breadcrumb.Root>
        <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
        <Breadcrumb.Ellipsis />
        <Breadcrumb.Link current>Here</Breadcrumb.Link>
      </Breadcrumb.Root>,
    );
    expect(screen.getByText("More pages")).toBeInTheDocument();
  });

  it("renders its child under asChild", () => {
    render(
      <Breadcrumb.Root>
        <Breadcrumb.Link asChild>
          <a href="/custom" data-testid="custom">Custom</a>
        </Breadcrumb.Link>
        <Breadcrumb.Link current>Here</Breadcrumb.Link>
      </Breadcrumb.Root>,
    );
    expect(screen.getByTestId("custom")).toHaveAttribute("href", "/custom");
  });
});
