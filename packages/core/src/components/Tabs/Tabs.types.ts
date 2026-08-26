import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type TabsVariant = "line" | "enclosed";
export type TabsOrientation = "horizontal" | "vertical";
/**
 * `automatic` selects a tab as soon as focus reaches it — right for cheap
 * panels. `manual` requires Enter or Space, which is the accessible choice when
 * a panel costs a network request, since arrowing past three tabs should not
 * fire three fetches.
 */
export type TabsActivation = "automatic" | "manual";

export interface TabsRootProps extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  children?: ReactNode;
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  /** @default "line" */
  variant?: TabsVariant | undefined;
  /** @default "horizontal" */
  orientation?: TabsOrientation | undefined;
  /** @default "automatic" */
  activation?: TabsActivation | undefined;
}

export interface TabsListProps extends ComponentPropsWithoutRef<"div"> {
  /** Accessible name for the tab list. */
  label?: string | undefined;
}

export interface TabsTriggerProps extends ComponentPropsWithoutRef<"button"> {
  value: string;
}

export interface TabsPanelProps extends ComponentPropsWithoutRef<"div"> {
  value: string;
  /** Render the panel even while hidden, so its state survives tab switches. */
  keepMounted?: boolean | undefined;
}
