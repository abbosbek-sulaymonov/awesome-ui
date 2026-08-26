import { forwardRef, useMemo } from "react";
import { useControllableState } from "../../hooks/useControllableState";
import { useField } from "../../hooks/useField";
import { useId } from "../../hooks/useId";
import { cn } from "../../utils/cn";
import { composeEventHandlers } from "../../utils/composeEventHandlers";
import { RadioGroupContext, useRadioGroupContext } from "./RadioGroupContext";
import styles from "./RadioGroup.module.css";
import type { RadioGroupItemProps, RadioGroupRootProps } from "./RadioGroup.types";

/**
 * Radio group over native inputs.
 *
 * Deliberately *not* built on `useRovingFocus`: radios sharing a `name` already
 * get arrow-key navigation, wrapping, and roving tabindex from the browser, and
 * on top of that they announce group position ("2 of 5") in screen readers.
 * Reimplementing that would replace working platform behaviour with a worse
 * copy — the roving hook exists for collections the platform does not cover,
 * like Menu and Tabs.
 *
 * The visible circle is a sibling of the real input, so `:focus-visible` and
 * `:checked` drive the visuals with no state mirroring.
 */
function RadioGroupRoot({
  children,
  value,
  defaultValue = "",
  onValueChange,
  name: providedName,
  size = "md",
  orientation = "vertical",
  disabled = false,
  required = false,
  label,
  description,
  errorMessage,
  invalid,
  className,
  id: providedId,
  "aria-describedby": providedDescribedBy,
  ...rest
}: RadioGroupRootProps) {
  const [selected, setSelected] = useControllableState<string>({
    value,
    defaultValue,
    ...(onValueChange ? { onChange: onValueChange } : {}),
  });

  const generatedName = useId(undefined, "aui-radio-name");
  const name = providedName ?? generatedName;

  const { id, descriptionId, errorId, isInvalid, describedBy, errorMessageId } = useField({
    id: providedId,
    hasDescription: description != null,
    hasError: errorMessage != null,
    invalid,
    describedBy: providedDescribedBy,
    prefix: "aui-radiogroup",
  });

  const contextValue = useMemo(
    () => ({
      value: selected,
      setValue: setSelected,
      name,
      size,
      disabled,
      required,
      isInvalid,
      describedBy: [describedBy, errorMessageId].filter(Boolean).join(" ") || undefined,
    }),
    [selected, setSelected, name, size, disabled, required, isInvalid, describedBy, errorMessageId],
  );

  return (
    <RadioGroupContext.Provider value={contextValue}>
      {/* A fieldset with a legend is what actually groups radios for screen
          readers; role="radiogroup" on a div is the fallback, not the ideal. */}
      <fieldset
        id={id}
        className={cn(styles.field, className)}
        disabled={disabled}
        data-invalid={isInvalid || undefined}
        {...rest}
      >
        {label != null ? (
          <legend className={styles.legend}>
            {label}
            {required ? (
              <span className={styles.required} aria-hidden="true">
                *
              </span>
            ) : null}
          </legend>
        ) : null}

        <div className={styles.group} data-orientation={orientation}>
          {children}
        </div>

        {description != null ? (
          <p className={styles.description} id={descriptionId}>
            {description}
          </p>
        ) : null}
        {errorMessage != null ? (
          <p className={styles.error} id={errorId}>
            {errorMessage}
          </p>
        ) : null}
      </fieldset>
    </RadioGroupContext.Provider>
  );
}

RadioGroupRoot.displayName = "RadioGroup.Root";

const RadioGroupItem = forwardRef<HTMLInputElement, RadioGroupItemProps>(
  function RadioGroupItem(
    { value: itemValue, label, description, className, id: providedId, disabled, onChange, ...rest },
    ref,
  ) {
    const group = useRadioGroupContext("RadioGroup.Item");

    const id = useId(providedId, "aui-radio");
    const descriptionId = `${id}-description`;

    const isChecked = group.value === itemValue;
    const isDisabled = Boolean(disabled) || group.disabled;

    // The item's own description plus whatever the group describes itself with.
    const describedBy =
      [description != null ? descriptionId : null, group.describedBy]
        .filter(Boolean)
        .join(" ") || undefined;

    return (
      <div className={styles.item}>
        <input
          ref={ref}
          type="radio"
          id={id}
          name={group.name}
          value={itemValue}
          checked={isChecked}
          disabled={isDisabled}
          required={group.required}
          className={cn(styles.input, className)}
          aria-invalid={group.isInvalid || undefined}
          aria-describedby={describedBy}
          onChange={composeEventHandlers(onChange, () => group.setValue(itemValue))}
          {...rest}
        />

        <span
          className={cn(styles.control, styles[group.size])}
          data-state={isChecked ? "checked" : "unchecked"}
          data-invalid={group.isInvalid || undefined}
          data-disabled={isDisabled || undefined}
          aria-hidden="true"
        >
          <span className={styles.dot} />
        </span>

        {label != null || description != null ? (
          <span className={styles.labelGroup}>
            {label != null ? (
              <label className={styles.label} htmlFor={id} data-disabled={isDisabled || undefined}>
                {label}
              </label>
            ) : null}
            {description != null ? (
              <p className={styles.itemDescription} id={descriptionId}>
                {description}
              </p>
            ) : null}
          </span>
        ) : null}
      </div>
    );
  },
);

RadioGroupItem.displayName = "RadioGroup.Item";

export const RadioGroup = { Root: RadioGroupRoot, Item: RadioGroupItem };
export { RadioGroupRoot, RadioGroupItem };
