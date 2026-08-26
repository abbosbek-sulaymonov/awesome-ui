import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarStatus = "online" | "offline" | "busy" | "away";

export interface AvatarOwnProps {
  /** @default "md" */
  size?: AvatarSize | undefined;
  /** Rounded square instead of a circle. */
  square?: boolean | undefined;
  src?: string | undefined;
  /**
   * The person or thing depicted. Used as the image's alt text and to derive
   * initials, so it should be a name rather than a description.
   */
  name?: string | undefined;
  /** Overrides the initials derived from `name`. */
  initials?: string | undefined;
  /** Replaces the initials entirely — an icon, for instance. */
  fallback?: ReactNode;
  /** Presence dot in the corner. */
  status?: AvatarStatus | undefined;
  /** Announced for the status dot. Defaults to the status word. */
  statusLabel?: string | undefined;
  /** Skip the deterministic tint and use the neutral surface. */
  monochrome?: boolean | undefined;
}

export interface AvatarProps
  extends AvatarOwnProps,
    Omit<ComponentPropsWithoutRef<"span">, keyof AvatarOwnProps> {}

export interface AvatarGroupProps extends ComponentPropsWithoutRef<"div"> {
  /** Show at most this many, then a +N counter. */
  max?: number | undefined;
  /** @default "md" */
  size?: AvatarSize | undefined;
}
