/**
 * Run the consumer's handler first, then our internal one.
 *
 * If the consumer calls `event.preventDefault()`, the internal handler is
 * skipped — that is the escape hatch that lets someone opt out of a
 * component's built-in behavior without forking it.
 */
export function composeEventHandlers<E extends { defaultPrevented: boolean }>(
  theirHandler: ((event: E) => void) | undefined,
  ourHandler: ((event: E) => void) | undefined,
  { checkForDefaultPrevented = true }: { checkForDefaultPrevented?: boolean } = {},
) {
  return function handleEvent(event: E) {
    theirHandler?.(event);

    if (checkForDefaultPrevented && event.defaultPrevented) return;
    ourHandler?.(event);
  };
}
