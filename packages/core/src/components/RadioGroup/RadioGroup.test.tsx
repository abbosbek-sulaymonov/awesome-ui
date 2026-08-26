import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RadioGroup } from "./RadioGroup";

function Basic(props: React.ComponentProps<typeof RadioGroup.Root> = {}) {
  return (
    <RadioGroup.Root label="Plan" name="plan" {...props}>
      <RadioGroup.Item value="free" label="Free" description="No card needed." />
      <RadioGroup.Item value="pro" label="Pro" />
      <RadioGroup.Item value="team" label="Team" disabled />
      <RadioGroup.Item value="enterprise" label="Enterprise" />
    </RadioGroup.Root>
  );
}

describe("RadioGroup", () => {
  it("groups its radios under a legend", () => {
    render(<Basic />);
    expect(screen.getByRole("group", { name: /Plan/ })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(4);
  });

  it("selects on click and reports the value", async () => {
    const onValueChange = vi.fn();
    render(<Basic onValueChange={onValueChange} />);

    await userEvent.click(screen.getByLabelText("Pro"));

    expect(screen.getByRole("radio", { name: "Pro" })).toBeChecked();
    expect(onValueChange).toHaveBeenCalledWith("pro");
  });

  it("moves between radios with arrow keys, from the browser", async () => {
    const onValueChange = vi.fn();
    render(<Basic defaultValue="free" onValueChange={onValueChange} />);

    // Native radios sharing a name already do roving focus and wrapping, which
    // is why this component does not use useRovingFocus.
    screen.getByRole("radio", { name: "Free" }).focus();
    await userEvent.keyboard("{ArrowDown}");

    expect(screen.getByRole("radio", { name: "Pro" })).toBeChecked();
    expect(onValueChange).toHaveBeenLastCalledWith("pro");
  });

  it("skips a disabled radio when arrowing", async () => {
    render(<Basic defaultValue="pro" />);
    screen.getByRole("radio", { name: "Pro" }).focus();

    await userEvent.keyboard("{ArrowDown}");

    expect(screen.getByRole("radio", { name: "Team" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "Enterprise" })).toBeChecked();
  });

  it("shares one name across every radio", () => {
    render(<Basic />);
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toHaveAttribute("name", "plan");
    }
  });

  it("describes an item from its own description", () => {
    render(<Basic />);
    expect(screen.getByRole("radio", { name: "Free" })).toHaveAccessibleDescription(
      /No card needed/,
    );
  });

  it("marks every radio invalid when the group is", () => {
    render(<Basic errorMessage="Pick a plan." />);
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toHaveAttribute("aria-invalid", "true");
    }
  });

  it("disables every radio when the group is disabled", () => {
    render(<Basic disabled />);
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toBeDisabled();
    }
  });

  it("stays controlled when a value is supplied", async () => {
    const onValueChange = vi.fn();
    render(<Basic value="free" onValueChange={onValueChange} />);

    await userEvent.click(screen.getByLabelText("Pro"));

    expect(onValueChange).toHaveBeenCalledWith("pro");
    expect(screen.getByRole("radio", { name: "Free" })).toBeChecked();
  });

  it("submits its value with the surrounding form", async () => {
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      expect(new FormData(event.currentTarget).get("plan")).toBe("pro");
    });

    render(
      <form onSubmit={onSubmit}>
        <Basic defaultValue="pro" />
        <button type="submit">Submit</button>
      </form>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
