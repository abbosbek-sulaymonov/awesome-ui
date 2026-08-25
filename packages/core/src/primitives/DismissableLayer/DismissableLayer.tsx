import { forwardRef, useEffect, useId, useRef, useState } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { useComposedRefs } from "../../utils/composeRefs";
import { isTopLayer, pushLayer, removeLayer, updateLayer } from "./layerStack";
import type { DismissReason } from "./layerStack";

export interface DismissableLayerProps extends ComponentPropsWithoutRef<"div"> {
  /** Called when the user asks to dismiss. Inspect the reason to filter. */
  onDismiss?: ((reason: DismissReason) => void) | undefined;
  /** Ignore Escape. */
  disableEscapeDismiss?: boolean | undefined;
  /** Ignore outside pointer presses. */
  disableOutsideDismiss?: boolean | undefined;
  /**
   * Pointer presses inside these elements count as inside the layer. Use it for
   * the trigger, so clicking it while open closes rather than immediately
   * reopening.
   */
  excludedElements?: (HTMLElement | null | undefined)[] | undefined;
}

/**
 * Wraps content that closes on Escape or on a press outside it.
 *
 * Dismissal is decided on `pointerdown`, not `click`: a click fires only after
 * pointerup, so a press that starts inside the layer and drags out — selecting
 * text and releasing past the edge — would otherwise read as an outside click
 * and close the layer mid-selection.
 */
export const DismissableLayer = forwardRef<HTMLDivElement, DismissableLayerProps>(
  function DismissableLayer(
    {
      onDismiss,
      disableEscapeDismiss = false,
      disableOutsideDismiss = false,
      excludedElements,
      ...rest
    },
    forwardedRef,
  ) {
    const id = useId();
    const [node, setNode] = useState<HTMLDivElement | null>(null);
    const ref = useComposedRefs<HTMLDivElement>(setNode, forwardedRef);

    // Read through refs inside the listeners so the layer does not have to
    // re-register on every render.
    const onDismissRef = useRef(onDismiss);
    onDismissRef.current = onDismiss;
    const excludedRef = useRef(excludedElements);
    excludedRef.current = excludedElements;

    // Registration is what establishes stacking order, so it must happen on
    // mount — before the element exists — and be patched once it does.
    useEffect(() => {
      pushLayer({
        id,
        element: null,
        onDismiss: (reason) => onDismissRef.current?.(reason),
        disableOutsideDismiss,
        disableEscapeDismiss,
      });
      return () => removeLayer(id);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
      updateLayer(id, { element: node, disableOutsideDismiss, disableEscapeDismiss });
    }, [id, node, disableOutsideDismiss, disableEscapeDismiss]);

    useEffect(() => {
      if (!node) return;
      const ownerDocument = node.ownerDocument;

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "Escape") return;
        if (disableEscapeDismiss) return;
        // Only the top layer responds, so Escape peels one layer at a time.
        if (!isTopLayer(id)) return;

        event.stopPropagation();
        onDismissRef.current?.("escape");
      };

      const onPointerDown = (event: PointerEvent) => {
        if (disableOutsideDismiss) return;
        if (!isTopLayer(id)) return;

        const target = event.target as Node | null;
        if (!target) return;
        if (node.contains(target)) return;

        const excluded = excludedRef.current?.some((element) =>
          element?.contains(target),
        );
        if (excluded) return;

        onDismissRef.current?.("outside-pointer");
      };

      ownerDocument.addEventListener("keydown", onKeyDown, true);
      // Deferred to the bubble phase so a handler on the trigger runs first.
      ownerDocument.addEventListener("pointerdown", onPointerDown);

      return () => {
        ownerDocument.removeEventListener("keydown", onKeyDown, true);
        ownerDocument.removeEventListener("pointerdown", onPointerDown);
      };
    }, [id, node, disableEscapeDismiss, disableOutsideDismiss]);

    return <div ref={ref} {...rest} />;
  },
);

DismissableLayer.displayName = "DismissableLayer";
