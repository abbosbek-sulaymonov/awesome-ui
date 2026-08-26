import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar, AvatarGroup } from "../../../src/components/Avatar/Avatar";

describe("Avatar", () => {
  it("derives initials from the first and last word", () => {
    render(<Avatar name="Ada Lovelace" />);
    expect(screen.getByText("AL")).toBeInTheDocument();
  });

  it("uses one letter for a single-word name", () => {
    render(<Avatar name="Prince" />);
    expect(screen.getByText("P")).toBeInTheDocument();
  });

  it("does not split a surrogate pair when deriving initials", () => {
    // charAt(0) would cut an astral-plane character in half and render a
    // replacement glyph.
    render(<Avatar name="𝒜da Lovelace" />);
    expect(screen.getByText("𝒜L")).toBeInTheDocument();
  });

  it("still announces the full name behind the initials", () => {
    render(<Avatar name="Ada Lovelace" />);
    // Initials are an abbreviation; the name has to reach assistive tech.
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
  });

  it("accepts explicit initials", () => {
    render(<Avatar name="Ada Lovelace" initials="AGL" />);
    expect(screen.getByText("AGL")).toBeInTheDocument();
  });

  it("renders an image with the name as alt text", () => {
    render(<Avatar name="Ada Lovelace" src="/ada.jpg" />);
    expect(screen.getByRole("img", { name: "Ada Lovelace" })).toHaveAttribute(
      "src",
      "/ada.jpg",
    );
  });

  it("falls back to initials when the image fails", () => {
    render(<Avatar name="Ada Lovelace" src="/missing.jpg" />);
    fireEvent.error(screen.getByRole("img", { name: "Ada Lovelace" }));

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("AL")).toBeInTheDocument();
  });

  it("retries when the source changes after a failure", () => {
    const { rerender } = render(<Avatar name="Ada" src="/missing.jpg" />);
    fireEvent.error(screen.getByRole("img"));
    expect(screen.queryByRole("img")).not.toBeInTheDocument();

    // A corrected URL must not stay broken.
    rerender(<Avatar name="Ada" src="/ada.jpg" />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/ada.jpg");
  });

  it("gives the same name the same tint every time", () => {
    const { container: a } = render(<Avatar name="Ada Lovelace" />);
    const { container: b } = render(<Avatar name="Ada Lovelace" />);

    expect(a.firstElementChild?.className).toBe(b.firstElementChild?.className);
  });

  it("announces a status dot", () => {
    render(<Avatar name="Ada" status="online" />);
    expect(screen.getByText("online")).toBeInTheDocument();
  });

  it("accepts a custom status label", () => {
    render(<Avatar name="Ada" status="busy" statusLabel="In a meeting" />);
    expect(screen.getByText("In a meeting")).toBeInTheDocument();
  });

  it("renders a custom fallback instead of initials", () => {
    render(<Avatar name="Ada" fallback={<span>ICON</span>} />);
    expect(screen.getByText("ICON")).toBeInTheDocument();
    expect(screen.queryByText("A")).not.toBeInTheDocument();
  });
});

describe("AvatarGroup", () => {
  it("shows every avatar when under the limit", () => {
    render(
      <AvatarGroup max={3}>
        <Avatar name="Ada Lovelace" />
        <Avatar name="Grace Hopper" />
      </AvatarGroup>,
    );

    expect(screen.getByText("AL")).toBeInTheDocument();
    expect(screen.getByText("GH")).toBeInTheDocument();
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it("counts the overflow past the limit", () => {
    render(
      <AvatarGroup max={2}>
        <Avatar name="Ada Lovelace" />
        <Avatar name="Grace Hopper" />
        <Avatar name="Alan Turing" />
        <Avatar name="Katherine Johnson" />
      </AvatarGroup>,
    );

    expect(screen.getByText("+2")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "2 more" })).toBeInTheDocument();
    expect(screen.queryByText("AT")).not.toBeInTheDocument();
  });

  it("imposes its size on every child", () => {
    render(
      <AvatarGroup size="lg">
        <Avatar name="Ada Lovelace" size="xs" />
      </AvatarGroup>,
    );

    // The group owns sizing so avatars in a stack always match.
    expect(screen.getByText("AL").closest("[data-size]")).toHaveAttribute("data-size", "lg");
  });
});
