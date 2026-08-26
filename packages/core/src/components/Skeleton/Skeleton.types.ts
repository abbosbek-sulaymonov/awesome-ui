import type { ComponentPropsWithoutRef } from "react";

export type SkeletonVariant = "rect" | "text" | "circle";
export type SkeletonAnimation = "pulse" | "wave" | "none";

export interface SkeletonOwnProps {
  /** @default "rect" */
  variant?: SkeletonVariant | undefined;
  /** @default "pulse" */
  animation?: SkeletonAnimation | undefined;
  width?: string | number | undefined;
  height?: string | number | undefined;
  /** Render this many stacked lines. Text variant only. @default 1 */
  lines?: number | undefined;
}

export interface SkeletonProps
  extends SkeletonOwnProps,
    Omit<ComponentPropsWithoutRef<"div">, keyof SkeletonOwnProps> {}
