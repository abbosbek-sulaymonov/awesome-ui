import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Progress } from "../../../src/components/Progress/Progress";

const bar = () => screen.getByRole("progressbar");

describe("Progress", () => {
  it("reports its value", () => {
    render(<Progress value={40} label="Upload" />);

    expect(bar()).toHaveAttribute("aria-valuenow", "40");
    expect(bar()).toHaveAttribute("aria-valuemin", "0");
    expect(bar()).toHaveAttribute("aria-valuemax", "100");
  });

  it("omits aria-valuenow entirely when indeterminate", () => {
    render(<Progress label="Working" />);

    // Sending 0 would announce "0 percent", which is a claim about progress
    // rather than an admission that the total is unknown.
    expect(bar()).not.toHaveAttribute("aria-valuenow");
    expect(bar()).not.toHaveAttribute("aria-valuetext");
  });

  it("treats an explicit null as indeterminate", () => {
    render(<Progress value={null} label="Working" />);
    expect(bar()).not.toHaveAttribute("aria-valuenow");
  });

  it("clamps a value outside the range", () => {
    render(<Progress value={150} label="Upload" />);
    expect(bar()).toHaveAttribute("aria-valuenow", "100");

    render(<Progress value={-20} label="Download" />);
    expect(screen.getAllByRole("progressbar")[1]).toHaveAttribute("aria-valuenow", "0");
  });

  it("survives a max of zero rather than rendering NaN", () => {
    render(<Progress value={5} max={0} label="Broken" />);
    expect(bar()).toHaveAttribute("aria-valuemax", "100");
    expect(bar().getAttribute("aria-valuetext")).not.toMatch(/NaN/);
  });

  it("scales against a custom max", () => {
    render(<Progress value={3} max={8} label="Files" showValue />);

    expect(bar()).toHaveAttribute("aria-valuemax", "8");
    expect(screen.getByText("38%")).toBeInTheDocument();
  });

  it("accepts a spoken value for units that mean more than a percentage", () => {
    render(<Progress value={3} max={8} label="Files" valueLabel="3 of 8 files" />);
    expect(bar()).toHaveAttribute("aria-valuetext", "3 of 8 files");
  });

  it("names itself from its label", () => {
    render(<Progress value={40} label="Upload" />);
    expect(bar()).toHaveAccessibleName("Upload");
  });

  it("falls back to a name when unlabelled", () => {
    render(<Progress value={40} />);
    expect(bar()).toHaveAccessibleName("Progress");
  });
});
