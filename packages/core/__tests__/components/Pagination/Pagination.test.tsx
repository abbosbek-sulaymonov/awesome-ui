import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "../../../src/components/Pagination/Pagination";

describe("Pagination", () => {
  it("is a named navigation landmark", () => {
    render(<Pagination count={5} />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
  });

  it("marks the current page", () => {
    render(<Pagination count={5} defaultPage={3} />);
    expect(screen.getByRole("button", { name: "Page 3" })).toHaveAttribute("aria-current", "page");
  });

  it("names each page rather than leaving a bare number", () => {
    render(<Pagination count={3} />);
    // A screen reader reading "2" has no idea what it selects.
    expect(screen.getByRole("button", { name: "Page 2" })).toBeInTheDocument();
  });

  it("changes page on click", async () => {
    const onPageChange = vi.fn();
    render(<Pagination count={5} defaultPage={1} onPageChange={onPageChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Page 3" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("steps with the arrows", async () => {
    const onPageChange = vi.fn();
    render(<Pagination count={5} defaultPage={2} onPageChange={onPageChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenLastCalledWith(3);

    await userEvent.click(screen.getByRole("button", { name: "Previous page" }));
    expect(onPageChange).toHaveBeenLastCalledWith(2);
  });

  it("disables the arrows at the ends rather than hiding them", () => {
    // A control that vanishes shifts every other button sideways as you page.
    render(<Pagination count={5} defaultPage={1} />);
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeEnabled();
  });

  it("renders an ellipsis with a spoken label", () => {
    render(<Pagination count={20} defaultPage={10} />);
    expect(screen.getAllByText("More pages").length).toBeGreaterThan(0);
  });

  it("stays controlled when page is supplied", async () => {
    const onPageChange = vi.fn();
    render(<Pagination count={5} page={1} onPageChange={onPageChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Page 3" }));

    expect(onPageChange).toHaveBeenCalledWith(3);
    expect(screen.getByRole("button", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
  });

  it("renders nothing when there are no pages", () => {
    const { container } = render(<Pagination count={0} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("disables every control when disabled", () => {
    render(<Pagination count={5} disabled />);
    for (const button of screen.getAllByRole("button")) {
      expect(button).toBeDisabled();
    }
  });

  it("can render pages as links", () => {
    render(
      <Pagination
        count={3}
        renderPage={(page, props) => (
          <a href={`?page=${page}`} {...props}>{page}</a>
        )}
      />
    );
    expect(screen.getByRole("link", { name: "2" })).toHaveAttribute("href", "?page=2");
  });
});
