import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { AsChildProps } from "../../types/polymorphic";

export interface BreadcrumbRootProps extends Omit<ComponentPropsWithoutRef<"nav">, "children"> {
  children?: ReactNode;
  /** Accessible name for the trail. @default "Breadcrumb" */
  label?: string | undefined;
  /** Character or node placed between items. @default "/" */
  separator?: ReactNode;
}

export interface BreadcrumbItemProps extends ComponentPropsWithoutRef<"li"> {}

export interface BreadcrumbLinkProps extends AsChildProps, ComponentPropsWithoutRef<"a"> {
  /** The page you are on. Renders as text and marks itself current. */
  current?: boolean | undefined;
}

export interface BreadcrumbEllipsisProps extends ComponentPropsWithoutRef<"span"> {}
