import { forwardRef } from "react";
import { useControllableState } from "../../hooks/useControllableState";
import { cn } from "../../utils/cn";
import { composeEventHandlers } from "../../utils/composeEventHandlers";
import { useToggleGroupContext } from "../ToggleGroup/ToggleGroupContext";
import styles from "./Toggle.module.css";
import type { ToggleProps } from "./Toggle.types";

/**
 * A button that stays pressed.
 *
 * `aria-pressed` rather than `role="switch"`: a toggle button applies a state
 * to something else — bold on the selection, a filter on a list — whereas a
 * switch *is* the setting. Screen readers say "pressed" for one and "on" for
 * the other, and they are not interchangeable.
 */
export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  {
    pressed,
    defaultPressed = false,
    onPressedChange,
    variant = "ghost",
    size = "md",
    value,
    className,
    disabled,
    onClick,
    ...rest
  },
  ref,
) {
  // Inside a group the group owns selection; standalone, the toggle owns it.
  const group = useToggleGroupContext();
  const inGroup = group !== null && value !== undefined;

  const [standalonePressed, setStandalonePressed] = useControllableState<boolean>({
    value: pressed,
    defaultValue: defaultPressed,
    ...(onPressedChange ? { onChange: onPressedChange } : {}),
  });

  const isPressed = inGroup ? group.isSelected(value) : standalonePressed;
  const isDisabled = Boolean(disabled) || Boolean(group?.disabled);

  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={isPressed}
      disabled={isDisabled}
      data-state={isPressed ? "on" : "off"}
      data-variant={variant}
      className={cn(styles.root, styles[variant], styles[size], className)}
      onClick={composeEventHandlers(onClick, () => {
        if (isDisabled) return;
        // useControllableState already reports through onPressedChange, so
        // calling it here as well would fire the callback twice per press.
        if (inGroup) group.toggle(value);
        else setStandalonePressed(!isPressed);
      })}
      {...rest}
    />
  );
});

Toggle.displayName = "Toggle";
