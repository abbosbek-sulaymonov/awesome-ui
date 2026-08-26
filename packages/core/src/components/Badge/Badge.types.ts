import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { AsChildProps } from "../../types/polymorphic";

export type BadgeVariant = "solid" | "soft" | "outline";
export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeOwnProps extends AsChildProps {
  /** @default "soft" */
  variant?: BadgeVariant | undefined;
  /** @default "neutral" */
  tone?: BadgeTone | undefined;
  /** @default "md" */
  size?: BadgeSize | undefined;
  /** Square corners instead of a pill. */
  square?: boolean | undefined;
  /** Leading status dot. */
  dot?: boolean | undefined;
  /**
   * Text announced in place of the visible content — for badges whose meaning
   * is carried by color or an abbreviation ("3" meaning "3 unread").
   */
  srLabel?: ReactNode;
}

export interface BadgeProps
  extends BadgeOwnProps,
    Omit<ComponentPropsWithoutRef<"span">, keyof BadgeOwnProps> {}
