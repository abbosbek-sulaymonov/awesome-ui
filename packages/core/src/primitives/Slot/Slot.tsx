import { Children, cloneElement, isValidElement } from "react";
import type { AnchorHTMLAttributes, ReactElement, ReactNode, Ref } from "react";
import { composeRefs } from "../../utils/composeRefs";

export interface SlotProps {
  children?: ReactNode;
  [key: string]: unknown;
}

type AnyProps = Record<string, unknown>;

/**
 * Renders its only child, merging the props it was given onto that child.
 *
 * This is what powers `asChild`: `<Button asChild><a href="/x">Go</a></Button>`
 * produces a real `<a>` that carries the button's classes, data attributes and
 * event handlers — no wrapper element, no cloned styling, correct semantics.
 *
 * Merge rules:
 *   - event handlers  -> both run, child's first
 *   - className       -> concatenated
 *   - style           -> merged, child wins on conflicts
 *   - ref             -> composed
 *   - everything else -> child wins (it is the more specific declaration)
 */
export function Slot({ children, ...slotProps }: SlotProps) {
  if (!isValidElement(children)) {
    if (process.env.NODE_ENV !== "production" && Children.count(children) > 1) {
      console.warn(
        "[awesome-ui] `asChild` expects exactly one React element child. " +
          "Wrap multiple children in a single element.",
      );
    }
    return null;
  }

  const child = children as ReactElement<AnyProps & { ref?: Ref<unknown> }>;

  return cloneElement(child, mergeProps(slotProps, child.props));
}

Slot.displayName = "Slot";

function mergeProps(slotProps: AnyProps, childProps: AnyProps): AnyProps {
  const merged: AnyProps = { ...slotProps };

  for (const key in childProps) {
    const slotValue = slotProps[key];
    const childValue = childProps[key];

    const isHandler = /^on[A-Z]/.test(key);

    if (isHandler) {
      // Both run; the child's own handler goes first so it can preventDefault.
      if (typeof slotValue === "function" && typeof childValue === "function") {
        merged[key] = (...args: unknown[]) => {
          (childValue as (...a: unknown[]) => unknown)(...args);
          (slotValue as (...a: unknown[]) => unknown)(...args);
        };
      } else {
        merged[key] = childValue ?? slotValue;
      }
      continue;
    }

    if (key === "style") {
      merged[key] = {
        ...(slotValue as object),
        ...(childValue as object),
      };
      continue;
    }

    if (key === "className") {
      merged[key] = [slotValue, childValue].filter(Boolean).join(" ");
      continue;
    }

    if (key === "ref") {
      merged[key] = composeRefs(slotValue as Ref<unknown>, childValue as Ref<unknown>);
      continue;
    }

    merged[key] = childValue;
  }

  return merged;
}

/**
 * `<a>`-aware guard used by interactive components: a disabled control that
 * renders as an anchor has no native disabled state, so we strip `href` and
 * mark it for assistive tech instead.
 */
export function disabledAnchorProps(
  disabled: boolean,
): AnchorHTMLAttributes<HTMLAnchorElement> | undefined {
  if (!disabled) return undefined;
  return { href: undefined, role: "link", "aria-disabled": true, tabIndex: -1 };
}
