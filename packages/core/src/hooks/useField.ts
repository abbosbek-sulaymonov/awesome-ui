import { useId } from "./useId";

export interface UseFieldParams {
  /** Caller-supplied id. One is generated when absent. */
  id?: string | undefined;
  /** Whether a description node is actually rendered. */
  hasDescription: boolean;
  /** Whether an error node is actually rendered. */
  hasError: boolean;
  /** Force the invalid state without an error message. */
  invalid?: boolean | undefined;
  /** Anything the caller already passed as `aria-describedby`. */
  describedBy?: string | undefined;
  /** Prefix for the generated id. */
  prefix?: string | undefined;
}

export interface UseFieldReturn {
  id: string;
  descriptionId: string;
  errorId: string;
  isInvalid: boolean;
  /** Ready for `aria-describedby`; `undefined` when there is nothing to point at. */
  describedBy: string | undefined;
  /** Ready for `aria-errormessage`. */
  errorMessageId: string | undefined;
}

/**
 * Shared label/description/error wiring for form controls.
 *
 * The rule this exists to enforce: never reference an id for an element that
 * was not rendered. A dangling `aria-describedby` is worse than none — screen
 * readers announce nothing and can drop the rest of the list with it.
 */
export function useField({
  id: providedId,
  hasDescription,
  hasError,
  invalid,
  describedBy: providedDescribedBy,
  prefix = "aui-field",
}: UseFieldParams): UseFieldReturn {
  const id = useId(providedId, prefix);
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  const describedBy =
    [providedDescribedBy, hasDescription ? descriptionId : null].filter(Boolean).join(" ") ||
    undefined;

  return {
    id,
    descriptionId,
    errorId,
    isInvalid: Boolean(invalid) || hasError,
    describedBy,
    errorMessageId: hasError ? errorId : undefined,
  };
}
