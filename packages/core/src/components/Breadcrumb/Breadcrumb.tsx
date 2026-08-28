import { Children, createContext, forwardRef, isValidElement, useContext } from "react";
import type { ReactNode } from "react";
import { Slot } from "../../primitives/Slot";
import { VisuallyHidden } from "../../primitives/VisuallyHidden";
import { cn } from "../../utils/cn";
import styles from "./Breadcrumb.module.css";
import type {
  BreadcrumbEllipsisProps,
  BreadcrumbItemProps,
  BreadcrumbLinkProps,
  BreadcrumbRootProps,
} from "./Breadcrumb.types";

const SeparatorContext = createContext<ReactNode>("/");

function BreadcrumbRoot({
  children,
  label = "Breadcrumb",
  separator = "/",
  className,
  ...rest
}: BreadcrumbRootProps) {
  const items = Children.toArray(children).filter(isValidElement);

  return (
    <SeparatorContext.Provider value={separator}>
      <nav aria-label={label} className={cn(styles.root, className)} {...rest}>
        <ol className={styles.list}>
          {items.map((child, index) => (
            <li className={styles.item} key={index}>
              {child}
              {/* Separators are decoration between items, not content. Hiding
                  them stops a screen reader reading "slash" between every
                  step of the trail. */}
              {index < items.length - 1 ? (
                <span className={styles.separator} aria-hidden="true">
                  {separator}
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </nav>
    </SeparatorContext.Provider>
  );
}

BreadcrumbRoot.displayName = "Breadcrumb.Root";

const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(function BreadcrumbItem(
  { className, ...rest },
  ref,
) {
  return <li ref={ref} className={cn(styles.item, className)} {...rest} />;
});

BreadcrumbItem.displayName = "Breadcrumb.Item";

const BreadcrumbLink = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  function BreadcrumbLink({ asChild, current, className, children, ...rest }, ref) {
    // The current page is not a link — it goes nowhere. Rendering it as one
    // gives a keyboard user a stop that does nothing when activated.
    if (current) {
      return (
        <span ref={ref as never} aria-current="page" className={cn(styles.current, className)}>
          {children}
        </span>
      );
    }

    const Comp = asChild ? Slot : "a";
    return (
      <Comp ref={ref} className={cn(styles.link, className)} {...rest}>
        {children}
      </Comp>
    );
  },
);

BreadcrumbLink.displayName = "Breadcrumb.Link";

const BreadcrumbEllipsis = forwardRef<HTMLSpanElement, BreadcrumbEllipsisProps>(
  function BreadcrumbEllipsis({ className, ...rest }, ref) {
    return (
      <span ref={ref} className={cn(styles.ellipsis, className)} {...rest}>
        <span aria-hidden="true">…</span>
        <VisuallyHidden>More pages</VisuallyHidden>
      </span>
    );
  },
);

BreadcrumbEllipsis.displayName = "Breadcrumb.Ellipsis";

/** Reads the separator the root was given, for custom item layouts. */
export function useBreadcrumbSeparator(): ReactNode {
  return useContext(SeparatorContext);
}

export const Breadcrumb = {
  Root: BreadcrumbRoot,
  Item: BreadcrumbItem,
  Link: BreadcrumbLink,
  Ellipsis: BreadcrumbEllipsis,
};

export { BreadcrumbRoot, BreadcrumbItem, BreadcrumbLink, BreadcrumbEllipsis };
