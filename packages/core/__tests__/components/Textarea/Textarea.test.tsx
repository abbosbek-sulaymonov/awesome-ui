import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Textarea } from "../../../src/components/Textarea/Textarea";

describe("Textarea", () => {
  it("associates its label with the control", () => {
    render(<Textarea label="Bio" />);
    expect(screen.getByLabelText("Bio")).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("wires description and error for assistive tech", () => {
    render(<Textarea label="Bio" description="Keep it short." errorMessage="Too long." />);

    const field = screen.getByLabelText("Bio");
    expect(field).toHaveAccessibleDescription("Keep it short.");
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAttribute("aria-errormessage", screen.getByText("Too long.").id);
  });

  it("does not point aria-describedby at an element it never rendered", () => {
    render(<Textarea label="Bio" />);
    expect(screen.getByLabelText("Bio")).not.toHaveAttribute("aria-describedby");
  });

  it("counts characters as they are typed", async () => {
    render(<Textarea label="Bio" showCount />);
    await userEvent.type(screen.getByLabelText("Bio"), "hello");

    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows the limit alongside the count", async () => {
    render(<Textarea label="Bio" showCount maxLength={10} />);
    await userEvent.type(screen.getByLabelText("Bio"), "abc");

    expect(screen.getByText("3/10")).toBeInTheDocument();
  });

  it("reports changes to the caller", async () => {
    const onChange = vi.fn();
    render(<Textarea label="Bio" onChange={onChange} />);

    await userEvent.type(screen.getByLabelText("Bio"), "hi");
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("stays controlled when a value is supplied", async () => {
    const onChange = vi.fn();
    render(<Textarea label="Bio" value="fixed" onChange={onChange} />);

    await userEvent.type(screen.getByLabelText("Bio"), "x");

    expect(onChange).toHaveBeenCalled();
    expect(screen.getByLabelText<HTMLTextAreaElement>("Bio").value).toBe("fixed");
  });

  it("resets height before measuring, so it can shrink as well as grow", async () => {
    render(<Textarea label="Bio" autoResize />);
    const field = screen.getByLabelText<HTMLTextAreaElement>("Bio");

    const heights: string[] = [];
    // scrollHeight never reports less than the current height, so measuring
    // without the reset makes the box grow-only. Recording the reset proves it
    // happens; jsdom cannot report a real scrollHeight to check the outcome.
    const setter = vi.spyOn(field.style, "height", "set");
    setter.mockImplementation(function (this: CSSStyleDeclaration, v: string) {
      heights.push(v);
    });

    await userEvent.type(field, "a\nb\nc");

    expect(heights).toContain("auto");
    setter.mockRestore();
  });

  it("takes the drag handle away when auto-resizing owns the height", () => {
    render(<Textarea label="Bio" autoResize />);
    expect(screen.getByLabelText("Bio").className).toMatch(/autoResize/);
  });

  it("forwards the ref to the textarea", () => {
    let node: HTMLTextAreaElement | null = null;
    render(<Textarea label="Bio" ref={(element) => void (node = element)} />);
    expect(node).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("participates in a form submission", async () => {
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      expect(new FormData(event.currentTarget).get("bio")).toBe("hello");
    });

    render(
      <form onSubmit={onSubmit}>
        <Textarea name="bio" label="Bio" defaultValue="hello" />
        <button type="submit">Submit</button>
      </form>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
