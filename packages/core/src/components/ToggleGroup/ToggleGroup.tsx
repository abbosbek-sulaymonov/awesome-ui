import { useCallback, useMemo, useState } from "react";
import { useControllableState } from "../../hooks/useControllableState";
import { useRovingFocus } from "../../hooks/useRovingFocus";
import { cn } from "../../utils/cn";
import toggleStyles from "../Toggle/Toggle.module.css";
import { ToggleGroupContext } from "./ToggleGroupContext";
import type { ToggleGroupProps } from "./ToggleGroup.types";

/**
 * Both union members flattened, so the root can destructure once.
 *
 * `collapsible` has to be listed here even though it only exists on the single
 * variant: anything left in `rest` is spread onto the root element, and React
 * warns about a non-boolean `collapsible` attribute on a div.
 */
type AnyGroupProps = Omit<
  ToggleGroupProps,
  "type" | "value" | "defaultValue" | "onValueChange"
> & {
  type?: "single" | "multiple" | undefined;
  value?: string | string[] | undefined;
  defaultValue?: string | string[] | undefined;
  onValueChange?: ((value: never) => void) | undefined;
  collapsible?: boolean | undefined;
};

const normalize = (value: string | string[] | undefined): string[] | undefined => {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value;
  return value === "" ? [] : [value];
};

/**
 * A set of toggles that share selection.
 *
 * Like Accordion, both modes are stored as an array internally, so the buttons
 * never branch on `type`; only the reported value differs.
 */
export function ToggleGroup(props: ToggleGroupProps) {
  const {
    children,
    orientation = "horizontal",
    joined = true,
    disabled = false,
    label,
    className,
    type,
    value: valueProp,
    defaultValue: defaultValueProp,
    onValueChange,
    collapsible = true,
    ...rest
  } = props as AnyGroupProps;

  const isMultiple = type === "multiple";

  const [selected, setSelected] = useControllableState<string[]>({
    value: normalize(valueProp),
    defaultValue: normalize(defaultValueProp) ?? [],
    onChange: (next) => {
      if (isMultiple) (onValueChange as ((v: string[]) => void) | undefined)?.(next);
      else (onValueChange as ((v: string) => void) | undefined)?.(next[0] ?? "");
    },
  });

  const [node, setNode] = useState<HTMLDivElement | null>(null);

  // Arrow keys move between buttons, the way they do in a toolbar.
  useRovingFocus({
    container: node,
    active: true,
    orientation: orientation === "vertical" ? "vertical" : "horizontal",
    itemSelector: "button:not(:disabled)",
  });

  const isSelected = useCallback((value: string) => selected.includes(value), [selected]);

  const toggle = useCallback(
    (value: string) => {
      setSelected((current) => {
        const on = current.includes(value);

        if (isMultiple) return on ? current.filter((entry) => entry !== value) : [...current, value];
        if (!on) return [value];
        return collapsible ? [] : current;
      });
    },
    [setSelected, isMultiple, collapsible],
  );

  const context = useMemo(
    () => ({ isSelected, toggle, disabled }),
    [isSelected, toggle, disabled],
  );

  return (
    <ToggleGroupContext.Provider value={context}>
      <div
        ref={setNode}
        // `group` rather than `toolbar`: a toolbar implies a collection of
        // different controls, while this is one control with several states.
        role="group"
        aria-label={label}
        aria-orientation={orientation === "vertical" ? "vertical" : undefined}
        data-orientation={orientation}
        className={cn(
          toggleStyles.group,
          joined ? toggleStyles.joined : toggleStyles.spaced,
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
}

ToggleGroup.displayName = "ToggleGroup";
