import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { VisuallyHidden } from "../../primitives/VisuallyHidden";
import styles from "./Table.module.css";
import type {
  TableBodyProps,
  TableCaptionProps,
  TableCellProps,
  TableEmptyProps,
  TableFooterProps,
  TableHeaderCellProps,
  TableHeaderProps,
  TableRootProps,
  TableRowProps,
} from "./Table.types";

const TableRoot = forwardRef<HTMLTableElement, TableRootProps>(function TableRoot(
  {
    density = "default",
    zebra,
    interactive,
    stickyHeader,
    plain,
    containerClassName,
    className,
    ...rest
  },
  ref,
) {
  return (
    <div className={cn(styles.container, plain && styles.plain, containerClassName)}>
      <table
        ref={ref}
        className={cn(
          styles.table,
          density === "compact" && styles.compact,
          density === "roomy" && styles.roomy,
          zebra && styles.zebra,
          interactive && styles.interactive,
          stickyHeader && styles.sticky,
          className,
        )}
        data-density={density}
        {...rest}
      />
    </div>
  );
});

TableRoot.displayName = "Table.Root";

const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(function TableHeader(
  { className, ...rest },
  ref,
) {
  return <thead ref={ref} className={cn(styles.head, className)} {...rest} />;
});
TableHeader.displayName = "Table.Header";

const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(function TableBody(
  { className, ...rest },
  ref,
) {
  return <tbody ref={ref} className={cn(styles.body, className)} {...rest} />;
});
TableBody.displayName = "Table.Body";

const TableFooter = forwardRef<HTMLTableSectionElement, TableFooterProps>(function TableFooter(
  { className, ...rest },
  ref,
) {
  return <tfoot ref={ref} className={cn(styles.foot, className)} {...rest} />;
});
TableFooter.displayName = "Table.Footer";

const TableCaption = forwardRef<HTMLTableCaptionElement, TableCaptionProps>(function TableCaption(
  { className, ...rest },
  ref,
) {
  // A caption names the table for assistive tech, which a heading above it
  // cannot do — the association is what makes it useful.
  return <caption ref={ref} className={cn(styles.caption, className)} {...rest} />;
});
TableCaption.displayName = "Table.Caption";

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { selected, className, ...rest },
  ref,
) {
  return (
    <tr
      ref={ref}
      className={cn(styles.row, className)}
      // `aria-selected` belongs to grid and listbox roles, not to a plain table
      // row; a data attribute styles it without lying about the semantics.
      data-selected={selected || undefined}
      {...rest}
    />
  );
});
TableRow.displayName = "Table.Row";

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { numeric, className, ...rest },
  ref,
) {
  return <td ref={ref} className={cn(styles.td, numeric && styles.numeric, className)} {...rest} />;
});
TableCell.displayName = "Table.Cell";

const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  function TableHeaderCell({ numeric, sort, onSort, className, children, ...rest }, ref) {
    const sortable = sort !== undefined;
    const active = sort === "ascending" || sort === "descending";

    return (
      <th
        ref={ref}
        scope="col"
        // Only the column actually being sorted carries aria-sort. Marking every
        // sortable column "none" is legal but noisy, and screen readers read it.
        aria-sort={active ? sort : undefined}
        className={cn(styles.th, numeric && styles.numeric, className)}
        {...rest}
      >
        {sortable ? (
          <button type="button" className={styles.sortButton} onClick={onSort}>
            {children}
            <svg
              className={styles.sortIcon}
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {sort === "ascending" ? (
                <path d="M8 12V4M4.5 7.5L8 4l3.5 3.5" />
              ) : sort === "descending" ? (
                <path d="M8 4v8M4.5 8.5L8 12l3.5-3.5" />
              ) : (
                <path d="M5 6.5L8 3.5l3 3M5 9.5l3 3 3-3" />
              )}
            </svg>
            {/* The icon is decorative; this is what says what pressing does. */}
            <VisuallyHidden>
              {active
                ? `, sorted ${sort}. Activate to change the sort order.`
                : ", sortable. Activate to sort by this column."}
            </VisuallyHidden>
          </button>
        ) : (
          children
        )}
      </th>
    );
  },
);

TableHeaderCell.displayName = "Table.HeaderCell";

const TableEmpty = forwardRef<HTMLTableCellElement, TableEmptyProps>(function TableEmpty(
  { className, children = "No data", ...rest },
  ref,
) {
  return (
    <td ref={ref} className={cn(styles.empty, className)} {...rest}>
      {children}
    </td>
  );
});

TableEmpty.displayName = "Table.Empty";

export const Table = {
  Root: TableRoot,
  Header: TableHeader,
  Body: TableBody,
  Footer: TableFooter,
  Caption: TableCaption,
  Row: TableRow,
  Cell: TableCell,
  HeaderCell: TableHeaderCell,
  Empty: TableEmpty,
};

export {
  TableRoot, TableHeader, TableBody, TableFooter, TableCaption,
  TableRow, TableCell, TableHeaderCell, TableEmpty,
};
