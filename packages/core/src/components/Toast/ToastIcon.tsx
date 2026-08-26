import type { ToastVariant } from "./toastStore";

const PATHS: Record<ToastVariant, string> = {
  success: "M13.5 4.5l-7 7L3 8",
  error: "M8 4.5v4.5M8 11.5h.01",
  warning: "M8 5v4M8 11.5h.01",
  info: "M8 7.5v4M8 4.5h.01",
};

/** Decorative — the variant is already announced through the live region. */
export function ToastIcon({ variant, className }: { variant: ToastVariant; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {variant === "success" ? null : <circle cx="8" cy="8" r="6.25" />}
      <path d={PATHS[variant]} />
    </svg>
  );
}
