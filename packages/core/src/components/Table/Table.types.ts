import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type TableDensity = "compact" | "default" | "roomy";
export type SortDirection = "ascending" | "descending";

export interface TableRootProps extends ComponentPropsWithoutRef<"table"> {
  /** @default "default" */
  density?: TableDensity | undefined;
  /** Shade alternate rows. */
  zebra?: boolean | undefined;
  /** Highlight rows on hover. Pair it with a real control in the row. */
  interactive?: boolean | undefined;
  /** Pin the header while the body scrolls. */
  stickyHeader?: boolean | undefined;
  /** Drop the surrounding border and radius. */
  plain?: boolean | undefined;
  /** Class for the scroll container around the table. */
  containerClassName?: string | undefined;
}

export interface TableHeaderProps extends ComponentPropsWithoutRef<"thead"> {}
export interface TableBodyProps extends ComponentPropsWithoutRef<"tbody"> {}
export interface TableFooterProps extends ComponentPropsWithoutRef<"tfoot"> {}
export interface TableCaptionProps extends ComponentPropsWithoutRef<"caption"> {}

export interface TableRowProps extends ComponentPropsWithoutRef<"tr"> {
  selected?: boolean | undefined;
}

export interface TableCellProps extends ComponentPropsWithoutRef<"td"> {
  /** Right-align and use tabular figures, so digits line up in a column. */
  numeric?: boolean | undefined;
}

export interface TableHeaderCellProps extends ComponentPropsWithoutRef<"th"> {
  numeric?: boolean | undefined;
  /**
   * Current sort of this column, or `false` when it is sortable but not the
   * one being sorted by. Omit entirely for a column that cannot be sorted.
   */
  sort?: SortDirection | false | undefined;
  onSort?: (() => void) | undefined;
}

export interface TableEmptyProps extends ComponentPropsWithoutRef<"td"> {
  children?: ReactNode;
}
