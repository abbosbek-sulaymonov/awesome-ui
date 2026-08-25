import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { AsChildProps } from "../../types/polymorphic";

export type ButtonVariant =
  | "solid"
  | "soft"
  | "outline"
  | "ghost"
  | "danger"
  | "link";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonOwnProps extends AsChildProps {
  /** Visual weight. @default "solid" */
  variant?: ButtonVariant | undefined;
  /** @default "md" */
  size?: ButtonSize | undefined;
  /** Show a spinner and block interaction, without changing the button's width. */
  loading?: boolean | undefined;
  /** Announced while `loading` is true. @default "Loading" */
  loadingLabel?: string | undefined;
  /** Rendered before the label. */
  startIcon?: ReactNode;
  /** Rendered after the label. */
  endIcon?: ReactNode;
  /** Stretch to the container's width. */
  fullWidth?: boolean | undefined;
  /** Square button with no label — `aria-label` becomes required in practice. */
  iconOnly?: boolean | undefined;
}

export interface ButtonProps
  extends ButtonOwnProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps> {}
