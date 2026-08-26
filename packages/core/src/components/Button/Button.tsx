import { forwardRef } from "react";
import type { ReactNode } from "react";
import { Slot, renderAsChild } from "../../primitives/Slot";
import { VisuallyHidden } from "../../primitives/VisuallyHidden";
import { cn } from "../../utils/cn";
import styles from "./Button.module.css";
import { buttonVariants } from "./Button.variants";
import type { ButtonProps } from "./Button.types";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    asChild,
    variant = "solid",
    size = "md",
    loading = false,
    loadingLabel = "Loading",
    startIcon,
    endIcon,
    fullWidth,
    iconOnly,
    disabled,
    className,
    children,
    type,
    ...rest
  },
  ref,
) {
  const isDisabled = Boolean(disabled) || loading;

  const rootProps = {
    className: cn(
      buttonVariants({ variant, size, iconOnly: iconOnly ? "true" : "false" }),
      className,
    ),
    "data-variant": variant,
    "data-size": size,
    "data-loading": loading || undefined,
    "data-disabled": isDisabled || undefined,
    "data-full-width": fullWidth || undefined,
    "aria-disabled": isDisabled || undefined,
    "aria-busy": loading || undefined,
    ...rest,
  };

  /** Wraps the label in the spinner/icon scaffolding. */
  const withAffixes = (label: ReactNode) => (
    <>
      {loading ? (
        <>
          <span className={styles.spinner} aria-hidden="true" />
          <VisuallyHidden>{loadingLabel}</VisuallyHidden>
        </>
      ) : null}

      {startIcon ? (
        <span className={styles.affix} aria-hidden="true">
          {startIcon}
        </span>
      ) : null}

      {label != null ? <span className={styles.label}>{label}</span> : null}

      {endIcon ? (
        <span className={styles.affix} aria-hidden="true">
          {endIcon}
        </span>
      ) : null}
    </>
  );

  if (asChild) {
    const content = renderAsChild(children, withAffixes, "Button");
    if (!content) return null;

    return (
      <Slot ref={ref} {...rootProps}>
        {content}
      </Slot>
    );
  }

  return (
    <button
      ref={ref}
      // Default it so a Button inside a <form> does not submit by accident.
      type={type ?? "button"}
      disabled={isDisabled}
      {...rootProps}
    >
      {withAffixes(children)}
    </button>
  );
});

Button.displayName = "Button";
