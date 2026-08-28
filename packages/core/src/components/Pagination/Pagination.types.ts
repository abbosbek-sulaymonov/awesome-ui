import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type PaginationSize = "sm" | "md" | "lg";
export type PaginationVariant = "ghost" | "outline";

export interface PaginationOwnProps {
  /** Total number of pages. */
  count: number;
  /** Current page, 1-based. */
  page?: number | undefined;
  defaultPage?: number | undefined;
  onPageChange?: ((page: number) => void) | undefined;
  /** Pages either side of the current one. @default 1 */
  siblings?: number | undefined;
  /** Pages pinned at each end. @default 1 */
  boundaries?: number | undefined;
  /** @default "md" */
  size?: PaginationSize | undefined;
  /** @default "ghost" */
  variant?: PaginationVariant | undefined;
  disabled?: boolean | undefined;
  /** Hide the previous and next arrows. */
  hideArrows?: boolean | undefined;
  /** Accessible name for the navigation. @default "Pagination" */
  label?: string | undefined;
  /**
   * Spoken name for a page button. Defaults to "Page N" — override it when the
   * pages are something more specific than numbers.
   */
  getPageLabel?: ((page: number) => string) | undefined;
  /** Render each page as a link rather than a button. */
  renderPage?: ((page: number, props: { "aria-current"?: "page" }) => ReactNode) | undefined;
}

export interface PaginationProps
  extends PaginationOwnProps,
    Omit<ComponentPropsWithoutRef<"nav">, keyof PaginationOwnProps> {}
