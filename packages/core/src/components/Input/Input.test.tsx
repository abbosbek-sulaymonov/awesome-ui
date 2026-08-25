import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Input } from "./Input";

describe("Input", () => {
  it("associates the visible label with the control", () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText("Email")).toBeInstanceOf(HTMLInputElement);
  });

  it("wires description through aria-describedby", () => {
    render(<Input label="Email" description="We never share it." />);
    expect(screen.getByLabelText("Email")).toHaveAccessibleDescription("We never share it.");
  });

  it("marks the field invalid and links the error message", () => {
    render(<Input label="Email" errorMessage="Enter a valid email." />);

    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute(
      "aria-errormessage",
      screen.getByText("Enter a valid email.").id,
    );
  });

  it("does not point aria-describedby at an element it never rendered", () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText("Email")).not.toHaveAttribute("aria-describedby");
  });

  it("keeps a caller-supplied describedby alongside its own", () => {
    render(
      <>
        <span id="external">External hint</span>
        <Input label="Email" description="Own hint" aria-describedby="external" />
      </>,
    );

    const describedBy = screen.getByLabelText("Email").getAttribute("aria-describedby");
    expect(describedBy).toContain("external");
    expect(describedBy?.split(" ")).toHaveLength(2);
  });

  it("honours an explicit id", () => {
    render(<Input id="my-email" label="Email" />);
    expect(screen.getByLabelText("Email")).toHaveAttribute("id", "my-email");
  });

  it("accepts typed input and reports changes", async () => {
    const onChange = vi.fn();
    render(<Input label="Email" onChange={onChange} />);

    await userEvent.type(screen.getByLabelText("Email"), "abek");
    expect(screen.getByLabelText<HTMLInputElement>("Email").value).toBe("abek");
    expect(onChange).toHaveBeenCalledTimes(4);
  });

  it("forwards the ref to the input element", () => {
    let node: HTMLInputElement | null = null;
    render(<Input label="Email" ref={(element) => void (node = element)} />);
    expect(node).toBeInstanceOf(HTMLInputElement);
  });
});
