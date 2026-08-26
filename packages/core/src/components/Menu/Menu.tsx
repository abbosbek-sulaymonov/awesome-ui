import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDisclosure } from "../../hooks/useDisclosure";
import { useFloating } from "../../hooks/useFloating";
import { useId } from "../../hooks/useId";
import { useRovingFocus } from "../../hooks/useRovingFocus";
import { useTypeahead } from "../../hooks/useTypeahead";
import { DismissableLayer } from "../../primitives/DismissableLayer";
import { Portal } from "../../primitives/Portal";
import { usePresence } from "../../primitives/Presence";
import { Slot } from "../../primitives/Slot";
import { cn } from "../../utils/cn";
import { composeEventHandlers } from "../../utils/composeEventHandlers";
import { useComposedRefs } from "../../utils/composeRefs";
import { MenuContext, useMenuContext } from "./MenuContext";
import styles from "./Menu.module.css";
import type {
  MenuCheckboxItemProps,
  MenuContentProps,
  MenuGroupProps,
  MenuItemProps,
  MenuLabelProps,
  MenuRootProps,
  MenuSeparatorProps,
  MenuTriggerProps,
} from "./Menu.types";

function MenuRoot({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  placement = "bottom-start",
}: MenuRootProps) {
  const { open: isOpen, setOpen } = useDisclosure({
    ...(open !== undefined ? { open } : {}),
    defaultOpen,
    ...(onOpenChange ? { onOpenChange } : {}),
  });

  const baseId = useId(undefined, "aui-menu");
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const floating = useFloating({ open: isOpen, placement, offset: 4 });

  const closeAndRestore = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }, [setOpen]);

  const contextValue = useMemo(
    () => ({
      open: isOpen,
      setOpen,
      contentId: `${baseId}-content`,
      triggerId: `${baseId}-trigger`,
      floating,
      triggerRef,
      closeAndRestore,
    }),
    [isOpen, setOpen, baseId, floating, closeAndRestore],
  );

  return <MenuContext.Provider value={contextValue}>{children}</MenuContext.Provider>;
}

MenuRoot.displayName = "Menu.Root";

const MenuTrigger = forwardRef<HTMLButtonElement, MenuTriggerProps>(function MenuTrigger(
  { asChild, onClick, onKeyDown, type, ...rest },
  forwardedRef,
) {
  const { open, setOpen, contentId, triggerId, floating, triggerRef } =
    useMenuContext("Menu.Trigger");

  const ref = useComposedRefs<HTMLButtonElement>(
    forwardedRef,
    floating.setAnchor,
    (node) => void (triggerRef.current = node),
  );

  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      id={triggerId}
      {...(asChild ? {} : { type: type ?? "button" })}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={open ? contentId : undefined}
      data-state={open ? "open" : "closed"}
      onClick={composeEventHandlers(onClick, () => setOpen(!open))}
      onKeyDown={composeEventHandlers(onKeyDown, (event) => {
        // Arrows open the menu rather than moving past it.
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          setOpen(true);
        }
      })}
      {...rest}
    />
  );
});

MenuTrigger.displayName = "Menu.Trigger";

const MenuContent = forwardRef<HTMLDivElement, MenuContentProps>(function MenuContent(
  { label, className, style, children, ...rest },
  forwardedRef,
) {
  const { open, setOpen, contentId, triggerId, floating, triggerRef, closeAndRestore } =
    useMenuContext("Menu.Content");

  const { isPresent, ref: presenceRef, state } = usePresence(open);
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const ref = useComposedRefs<HTMLDivElement>(
    forwardedRef,
    presenceRef,
    floating.setFloating,
    setNode,
  );

  const { getItems, focusItem, focusFirst } = useRovingFocus({
    container: node,
    active: open && isPresent,
    orientation: "vertical",
    itemSelector: '[role^="menuitem"]:not([data-disabled])',
  });

  useTypeahead({
    active: open && isPresent,
    container: node,
    getItems,
    onMatch: focusItem,
  });

  /**
   * A menu opens with its first item focused; leaving focus on the trigger
   * would make the arrow keys do nothing.
   *
   * A plain effect for the same reason as Select: the content is
   * `visibility: hidden` until useFloating has measured, and a hidden element
   * cannot take focus. Effects run after layout effects, so the position has
   * landed by the time this runs.
   */
  useEffect(() => {
    if (open && node) focusFirst();
  }, [open, node, focusFirst]);

  const onDismiss = useCallback(
    (reason: "escape" | "outside-pointer" | "focus-outside") => {
      if (reason === "escape") closeAndRestore();
      else setOpen(false);
    },
    [closeAndRestore, setOpen],
  );

  if (!isPresent) return null;

  return (
    <Portal>
      <DismissableLayer
        ref={ref}
        id={contentId}
        role="menu"
        aria-labelledby={label ? undefined : triggerId}
        aria-label={label}
        aria-orientation="vertical"
        data-state={state}
        data-side={floating.position?.side ?? "bottom"}
        className={cn(styles.content, className)}
        style={{ ...floating.floatingStyles, ...style }}
        onDismiss={onDismiss}
        excludedElements={[triggerRef.current]}
        {...rest}
      >
        {children}
      </DismissableLayer>
    </Portal>
  );
});

MenuContent.displayName = "Menu.Content";

/** Shared select-and-close behaviour for every kind of menu item. */
function useMenuItemSelect(
  disabled: boolean | undefined,
  onSelect: MenuItemProps["onSelect"],
) {
  const { closeAndRestore } = useMenuContext("Menu.Item");

  return useCallback(() => {
    if (disabled) return;

    // A synthetic event so an item can keep the menu open by preventing the
    // default — the pattern a toggle item needs.
    let defaultPrevented = false;
    onSelect?.({
      preventDefault: () => void (defaultPrevented = true),
      get defaultPrevented() {
        return defaultPrevented;
      },
    });

    if (!defaultPrevented) closeAndRestore();
  }, [disabled, onSelect, closeAndRestore]);
}

const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(function MenuItem(
  { disabled, danger, shortcut, onSelect, className, children, onClick, onKeyDown, ...rest },
  ref,
) {
  const select = useMenuItemSelect(disabled, onSelect);

  return (
    <div
      ref={ref}
      role="menuitem"
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      data-disabled={disabled || undefined}
      className={cn(styles.item, danger && styles.danger, className)}
      onClick={composeEventHandlers(onClick, select)}
      onKeyDown={composeEventHandlers(onKeyDown, (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          select();
        }
      })}
      {...rest}
    >
      <span className={styles.itemText}>{children}</span>
      {shortcut != null ? (
        <span className={styles.shortcut} aria-hidden="true">
          {shortcut}
        </span>
      ) : null}
    </div>
  );
});

MenuItem.displayName = "Menu.Item";

const MenuCheckboxItem = forwardRef<HTMLDivElement, MenuCheckboxItemProps>(
  function MenuCheckboxItem(
    { checked = false, onCheckedChange, disabled, danger, shortcut, className, children, onClick, onKeyDown, ...rest },
    ref,
  ) {
    // A toggle stays open, so the menu can be used to flip several things.
    const select = useMenuItemSelect(disabled, (event) => {
      event.preventDefault();
      onCheckedChange?.(!checked);
    });

    return (
      <div
        ref={ref}
        role="menuitemcheckbox"
        tabIndex={-1}
        aria-checked={checked}
        aria-disabled={disabled || undefined}
        data-disabled={disabled || undefined}
        data-state={checked ? "checked" : "unchecked"}
        className={cn(styles.item, danger && styles.danger, className)}
        onClick={composeEventHandlers(onClick, select)}
        onKeyDown={composeEventHandlers(onKeyDown, (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            select();
          }
        })}
        {...rest}
      >
        <span className={styles.indicator} aria-hidden="true">
          {checked ? (
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3.5 8.5l3 3 6-6" />
            </svg>
          ) : null}
        </span>
        <span className={styles.itemText}>{children}</span>
        {shortcut != null ? (
          <span className={styles.shortcut} aria-hidden="true">
            {shortcut}
          </span>
        ) : null}
      </div>
    );
  },
);

MenuCheckboxItem.displayName = "Menu.CheckboxItem";

const MenuGroup = forwardRef<HTMLDivElement, MenuGroupProps>(function MenuGroup(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} role="group" className={className} {...rest} />;
});

MenuGroup.displayName = "Menu.Group";

const MenuLabel = forwardRef<HTMLDivElement, MenuLabelProps>(function MenuLabel(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cn(styles.groupLabel, className)} {...rest} />;
});

MenuLabel.displayName = "Menu.Label";

const MenuSeparator = forwardRef<HTMLDivElement, MenuSeparatorProps>(function MenuSeparator(
  { className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation="horizontal"
      className={cn(styles.separator, className)}
      {...rest}
    />
  );
});

MenuSeparator.displayName = "Menu.Separator";

export const Menu = {
  Root: MenuRoot,
  Trigger: MenuTrigger,
  Content: MenuContent,
  Item: MenuItem,
  CheckboxItem: MenuCheckboxItem,
  Group: MenuGroup,
  Label: MenuLabel,
  Separator: MenuSeparator,
};

export {
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuCheckboxItem,
  MenuGroup,
  MenuLabel,
  MenuSeparator,
};
