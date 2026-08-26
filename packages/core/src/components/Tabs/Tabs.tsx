import { forwardRef, useMemo, useState } from "react";
import { useControllableState } from "../../hooks/useControllableState";
import { useId } from "../../hooks/useId";
import { useRovingFocus } from "../../hooks/useRovingFocus";
import { cn } from "../../utils/cn";
import { composeEventHandlers } from "../../utils/composeEventHandlers";
import { useComposedRefs } from "../../utils/composeRefs";
import { TabsContext, useTabsContext } from "./TabsContext";
import styles from "./Tabs.module.css";
import type {
  TabsListProps,
  TabsPanelProps,
  TabsRootProps,
  TabsTriggerProps,
} from "./Tabs.types";

function TabsRoot({
  children,
  value,
  defaultValue = "",
  onValueChange,
  variant = "line",
  orientation = "horizontal",
  activation = "automatic",
  className,
  ...rest
}: TabsRootProps) {
  const [selected, setSelected] = useControllableState<string>({
    value,
    defaultValue,
    ...(onValueChange ? { onChange: onValueChange } : {}),
  });

  const baseId = useId(undefined, "aui-tabs");

  const contextValue = useMemo(
    () => ({
      value: selected,
      setValue: setSelected,
      baseId,
      variant,
      orientation,
      activation,
      triggerId: (itemValue: string) => `${baseId}-trigger-${itemValue}`,
      panelId: (itemValue: string) => `${baseId}-panel-${itemValue}`,
    }),
    [selected, setSelected, baseId, variant, orientation, activation],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div
        className={cn(styles.root, className)}
        data-orientation={orientation}
        {...rest}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

TabsRoot.displayName = "Tabs.Root";

const TabsList = forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { label, className, ...rest },
  forwardedRef,
) {
  const { variant, orientation, activation, setValue } = useTabsContext("Tabs.List");
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const ref = useComposedRefs<HTMLDivElement>(forwardedRef, setNode);

  useRovingFocus({
    container: node,
    active: true,
    // Arrow direction follows the visual layout, which is what the ARIA
    // tabs pattern specifies.
    orientation: orientation === "vertical" ? "vertical" : "horizontal",
    itemSelector: '[role="tab"]:not([data-disabled])',
    onFocusChange: (item) => {
      if (activation !== "automatic") return;
      const itemValue = item.getAttribute("data-value");
      if (itemValue) setValue(itemValue);
    },
  });

  return (
    <div
      ref={ref}
      role="tablist"
      aria-label={label}
      aria-orientation={orientation}
      data-orientation={orientation}
      className={cn(styles.list, styles[variant], className)}
      {...rest}
    />
  );
});

TabsList.displayName = "Tabs.List";

const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(function TabsTrigger(
  { value: itemValue, className, disabled, onClick, onKeyDown, type, ...rest },
  ref,
) {
  const { value, setValue, triggerId, panelId, activation } = useTabsContext("Tabs.Trigger");
  const isActive = value === itemValue;

  return (
    <button
      ref={ref}
      type={type ?? "button"}
      role="tab"
      id={triggerId(itemValue)}
      // Only the active tab is in the tab order; arrows move between the rest.
      tabIndex={isActive ? 0 : -1}
      aria-selected={isActive}
      aria-controls={panelId(itemValue)}
      disabled={disabled}
      data-value={itemValue}
      data-state={isActive ? "active" : "inactive"}
      data-disabled={disabled || undefined}
      className={cn(styles.trigger, className)}
      onClick={composeEventHandlers(onClick, () => setValue(itemValue))}
      onKeyDown={composeEventHandlers(onKeyDown, (event) => {
        // In manual mode the arrow keys only move focus; this is what commits.
        if (activation === "manual" && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          setValue(itemValue);
        }
      })}
      {...rest}
    />
  );
});

TabsTrigger.displayName = "Tabs.Trigger";

const TabsPanel = forwardRef<HTMLDivElement, TabsPanelProps>(function TabsPanel(
  { value: itemValue, keepMounted, className, children, ...rest },
  ref,
) {
  const { value, triggerId, panelId } = useTabsContext("Tabs.Panel");
  const isActive = value === itemValue;

  if (!isActive && !keepMounted) return null;

  return (
    <div
      ref={ref}
      role="tabpanel"
      id={panelId(itemValue)}
      aria-labelledby={triggerId(itemValue)}
      // Focusable so that tabbing out of the tablist lands in the panel, which
      // is where the content the tab announced actually is.
      tabIndex={0}
      hidden={!isActive}
      data-state={isActive ? "active" : "inactive"}
      className={cn(styles.panel, className)}
      {...rest}
    >
      {children}
    </div>
  );
});

TabsPanel.displayName = "Tabs.Panel";

export const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Trigger: TabsTrigger,
  Panel: TabsPanel,
};

export { TabsRoot, TabsList, TabsTrigger, TabsPanel };
