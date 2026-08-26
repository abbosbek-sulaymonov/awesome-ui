import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type AlertVariant = "soft" | "outline";
export type AlertTone = "info" | "success" | "warning" | "danger";

export interface AlertOwnProps {
  /** @default "soft" */
  variant?: AlertVariant | undefined;
  /** @default "info" */
  tone?: AlertTone | undefined;
  title?: ReactNode;
  /** Replaces the tone's default icon. Pass `null` for no icon. */
  icon?: ReactNode;
  /** Buttons rendered under the message. */
  actions?: ReactNode;
  /** Show a close button and call this when it is pressed. */
  onDismiss?: (() => void) | undefined;
  /** @default "Dismiss" */
  dismissLabel?: string | undefined;
  /**
   * Announce this alert when it appears.
   *
   * Off by default, deliberately. An alert rendered with the page is part of
   * the page, and `role="alert"` on mount interrupts whatever a screen reader
   * was saying to read out something the user has not navigated to yet. Turn it
   * on for messages that appear in response to an action.
   */
  live?: boolean | undefined;
}

export interface AlertProps
  extends AlertOwnProps,
    Omit<ComponentPropsWithoutRef<"div">, keyof AlertOwnProps | "title"> {}
