import { forwardRef, useCallback, useRef, useState } from "react";
import { useControllableState } from "../../hooks/useControllableState";
import { useId } from "../../hooks/useId";
import { cn } from "../../utils/cn";
import styles from "./Slider.module.css";
import type { SliderProps } from "./Slider.types";

/**
 * Rounds to the nearest step, measured from `min` rather than from zero.
 *
 * Measuring from zero puts the reachable values on the wrong grid whenever min
 * is not itself a multiple of step: min 5 step 10 should offer 5, 15, 25 — not
 * 10, 20, 30 with the minimum unreachable.
 *
 * The result is rounded to the step's own decimal precision, because repeated
 * float arithmetic otherwise produces values like 0.30000000000000004 and
 * surfaces them in the label.
 */
function snap(value: number, min: number, max: number, step: number): number {
  if (step <= 0) return Math.min(Math.max(value, min), max);

  const steps = Math.round((value - min) / step);
  const snapped = min + steps * step;

  const decimals = (String(step).split(".")[1] ?? "").length;
  const rounded = decimals > 0 ? Number(snapped.toFixed(decimals)) : snapped;

  return Math.min(Math.max(rounded, min), max);
}

const toPair = (value: number | [number, number]): [number, number] =>
  Array.isArray(value) ? value : [value, value];

export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
  {
    value,
    defaultValue = 0,
    onValueChange,
    onValueCommit,
    min = 0,
    max = 100,
    step = 1,
    largeStep,
    minStepsBetweenThumbs = 0,
    size = "md",
    tone = "accent",
    disabled = false,
    label,
    showValue,
    marks,
    formatValue,
    name,
    className,
    id: providedId,
    ...rest
  },
  ref,
) {
  const isRange = Array.isArray(value ?? defaultValue);

  const [current, setCurrent] = useControllableState<number | [number, number]>({
    value,
    defaultValue,
    ...(onValueChange ? { onChange: onValueChange } : {}),
  });

  const id = useId(providedId, "aui-slider");
  const labelId = `${id}-label`;

  const trackRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);

  const [low, high] = toPair(current);
  const span = max - min || 1;
  const percentOf = (n: number) => ((n - min) / span) * 100;

  const format = useCallback(
    (n: number) => formatValue?.(n) ?? String(n),
    [formatValue],
  );

  /**
   * Writes one thumb, keeping a range ordered and honouring any required gap.
   *
   * Thumbs are clamped against each other rather than allowed to swap: swapping
   * means the thumb under the pointer changes identity mid-drag, which loses
   * keyboard focus and makes the gesture jump.
   */
  const commit = useCallback(
    (index: number, next: number, done = false) => {
      const snapped = snap(next, min, max, step);
      const gap = minStepsBetweenThumbs * step;

      let result: number | [number, number];

      if (!isRange) {
        result = snapped;
      } else if (index === 0) {
        result = [Math.min(snapped, high - gap), high];
      } else {
        result = [low, Math.max(snapped, low + gap)];
      }

      setCurrent(result);
      if (done) onValueCommit?.(result);
    },
    [min, max, step, minStepsBetweenThumbs, isRange, low, high, setCurrent, onValueCommit],
  );

  /** Which thumb a pointer press should grab: whichever is closer. */
  const nearestThumb = useCallback(
    (position: number) => {
      if (!isRange) return 0;
      return Math.abs(position - low) <= Math.abs(position - high) ? 0 : 1;
    },
    [isRange, low, high],
  );

  const valueFromPointer = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return min;

      const rect = track.getBoundingClientRect();
      if (rect.width === 0) return min;

      const ratio = (clientX - rect.left) / rect.width;
      return min + Math.min(Math.max(ratio, 0), 1) * span;
    },
    [min, span],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || event.button !== 0) return;

    const raw = valueFromPointer(event.clientX);
    const index = nearestThumb(raw);

    setDragging(index);
    commit(index, raw);

    // Capture on the control, so a drag that leaves the element keeps tracking
    // instead of stopping the moment the pointer crosses the edge.
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragging === null) return;
    commit(dragging, valueFromPointer(event.clientX));
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragging === null) return;
    commit(dragging, valueFromPointer(event.clientX), true);
    setDragging(null);
  };

  const onThumbKeyDown = (index: number) => (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    const big = largeStep ?? step * 10;
    const at = isRange ? (index === 0 ? low : high) : low;

    let next: number | null = null;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        next = at + step;
        break;
      case "ArrowLeft":
      case "ArrowDown":
        next = at - step;
        break;
      case "PageUp":
        next = at + big;
        break;
      case "PageDown":
        next = at - big;
        break;
      case "Home":
        next = min;
        break;
      case "End":
        next = max;
        break;
      default:
        return;
    }

    // These keys otherwise scroll the page out from under the control.
    event.preventDefault();
    commit(index, next, true);
  };

  const thumbs = isRange ? [low, high] : [low];

  return (
    <div
      ref={ref}
      className={cn(styles.root, styles[size], className)}
      data-tone={tone}
      data-disabled={disabled || undefined}
      {...rest}
    >
      {label != null || showValue ? (
        <div className={styles.header}>
          {label != null ? (
            <span className={styles.label} id={labelId}>
              {label}
            </span>
          ) : (
            <span />
          )}
          {showValue ? (
            <span className={styles.value}>
              {isRange ? `${format(low)} – ${format(high)}` : format(low)}
            </span>
          ) : null}
        </div>
      ) : null}

      <div
        className={styles.control}
        data-disabled={disabled || undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className={styles.track} ref={trackRef}>
          <div
            className={styles.range}
            style={
              isRange
                ? { left: `${percentOf(low)}%`, width: `${percentOf(high) - percentOf(low)}%` }
                : { left: 0, width: `${percentOf(low)}%` }
            }
          />

          {thumbs.map((thumbValue, index) => (
            <div
              key={index}
              // `slider` is the role for the thumb, not the track — the thumb is
              // what is focused and what the value belongs to.
              role="slider"
              tabIndex={disabled ? -1 : 0}
              aria-valuemin={isRange && index === 1 ? low : min}
              aria-valuemax={isRange && index === 0 ? high : max}
              aria-valuenow={thumbValue}
              aria-valuetext={format(thumbValue)}
              aria-orientation="horizontal"
              aria-disabled={disabled || undefined}
              aria-labelledby={label != null ? labelId : undefined}
              aria-label={
                label == null
                  ? isRange
                    ? index === 0
                      ? "Minimum"
                      : "Maximum"
                    : "Value"
                  : undefined
              }
              data-dragging={dragging === index || undefined}
              className={styles.thumb}
              style={{ left: `${percentOf(thumbValue)}%` }}
              onKeyDown={onThumbKeyDown(index)}
            />
          ))}
        </div>
      </div>

      {marks && marks.length > 0 ? (
        <div className={styles.marks} aria-hidden="true">
          {marks.map((mark) => (
            <span
              key={mark.value}
              className={styles.mark}
              style={{ left: `${percentOf(mark.value)}%` }}
            >
              {mark.label ?? mark.value}
            </span>
          ))}
        </div>
      ) : null}

      {/* A div with role="slider" submits nothing, so a form needs real inputs. */}
      {name
        ? thumbs.map((thumbValue, index) => (
            <input
              key={index}
              type="hidden"
              name={isRange ? `${name}[${index}]` : name}
              value={thumbValue}
            />
          ))
        : null}
    </div>
  );
});

Slider.displayName = "Slider";
