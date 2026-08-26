import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Toaster } from "./Toaster";
import { toast } from "./toast";
import { resetToastStore } from "./toastStore";

// The reset notifies subscribers, so a mounted Toaster re-renders from it.
afterEach(() => act(() => resetToastStore()));

describe("Toaster", () => {
  it("renders the live region before any toast exists", () => {
    render(<Toaster />);

    // The region must be in the accessibility tree ahead of its first message,
    // or screen readers will not announce it.
    const region = screen.getByLabelText("Notifications");
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute("aria-live", "polite");
  });

  it("shows a toast pushed from outside React", async () => {
    render(<Toaster />);

    act(() => void toast.success("Saved"));

    expect(await screen.findByText("Saved")).toBeInTheDocument();
  });

  it("renders title, description and variant", async () => {
    render(<Toaster />);

    act(() => void toast.error("Could not save", { description: "Network unreachable" }));

    expect(await screen.findByText("Could not save")).toBeInTheDocument();
    expect(screen.getByText("Network unreachable")).toBeInTheDocument();
    expect(screen.getByRole("listitem")).toHaveAttribute("data-variant", "error");
  });

  it("escalates the live region to assertive for errors", async () => {
    render(<Toaster />);
    const region = screen.getByLabelText("Notifications");

    act(() => void toast.info("Heads up"));
    await screen.findByText("Heads up");
    expect(region).toHaveAttribute("aria-live", "polite");

    act(() => void toast.error("Failed"));
    await screen.findByText("Failed");
    expect(region).toHaveAttribute("aria-live", "assertive");
  });

  it("dismisses from the close button", async () => {
    render(<Toaster />);
    act(() => void toast("Saved"));
    await screen.findByText("Saved");

    await userEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
    await waitFor(() => expect(screen.queryByText("Saved")).not.toBeInTheDocument());
  });

  it("runs an action and then dismisses", async () => {
    const onClick = vi.fn();
    render(<Toaster />);

    act(() =>
      void toast("Deleted", { action: { label: "Undo", onClick } }),
    );
    await screen.findByText("Deleted");

    await userEvent.click(screen.getByRole("button", { name: "Undo" }));

    expect(onClick).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByText("Deleted")).not.toBeInTheDocument());
  });

  it("hides the close button when the toast is not dismissible", async () => {
    render(<Toaster />);
    act(() => void toast("Working", { dismissible: false }));
    await screen.findByText("Working");

    expect(
      screen.queryByRole("button", { name: "Dismiss notification" }),
    ).not.toBeInTheDocument();
  });

  it("caps how many toasts are on screen at once", async () => {
    render(<Toaster limit={2} />);

    act(() => {
      toast("One");
      toast("Two");
      toast("Three");
    });

    await screen.findByText("One");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.queryByText("Three")).not.toBeInTheDocument();
  });

  it("exposes the viewport position for styling", () => {
    render(<Toaster position="top-center" />);
    expect(screen.getByLabelText("Notifications")).toHaveAttribute(
      "data-position",
      "top-center",
    );
  });

  it("accepts a custom accessible name", () => {
    render(<Toaster label="Alerts" />);
    expect(screen.getByLabelText("Alerts")).toBeInTheDocument();
  });

  it("moves a promise toast from loading to success in place", async () => {
    render(<Toaster />);
    let resolve!: (value: string) => void;
    const promise = new Promise<string>((r) => void (resolve = r));

    act(() => {
      void toast.promise(promise, {
        loading: "Saving…",
        success: (value) => `Saved ${value}`,
        error: "Failed",
      });
    });

    expect(await screen.findByText("Saving…")).toBeInTheDocument();

    await act(async () => {
      resolve("draft");
      await promise;
    });

    expect(await screen.findByText("Saved draft")).toBeInTheDocument();
    expect(screen.queryByText("Saving…")).not.toBeInTheDocument();
    // One toast throughout — updated, not replaced.
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("moves a promise toast to the error state on rejection", async () => {
    render(<Toaster />);
    const promise = Promise.reject(new Error("boom"));

    act(() => {
      void toast
        .promise(promise, {
          loading: "Saving…",
          success: "Saved",
          error: (error) => `Failed: ${(error as Error).message}`,
        })
        .catch(() => {});
    });

    expect(await screen.findByText("Failed: boom")).toBeInTheDocument();
    expect(screen.getByRole("listitem")).toHaveAttribute("data-variant", "error");
  });

  it("supports a custom toast renderer", async () => {
    render(<Toaster renderToast={(item) => <span>custom: {item.title}</span>} />);
    act(() => void toast("Saved"));

    expect(await screen.findByText(/custom:/)).toBeInTheDocument();
  });
});
