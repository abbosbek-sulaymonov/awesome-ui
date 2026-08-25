import { useState } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";

export interface PortalProps {
  children?: ReactNode;
  /** Where to mount. Defaults to `document.body`. */
  container?: Element | DocumentFragment | null | undefined;
  /** Render in place instead of portalling — useful inside an existing layer. */
  disabled?: boolean | undefined;
}

/**
 * SSR-safe portal. Renders nothing on the server and on the first client pass,
 * then mounts once a container exists — which keeps hydration byte-identical.
 */
export function Portal({ children, container, disabled }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useIsomorphicLayoutEffect(() => {
    setMounted(true);
  }, []);

  if (disabled) return <>{children}</>;
  if (!mounted) return null;

  const target = container ?? (typeof document !== "undefined" ? document.body : null);
  if (!target) return null;

  return createPortal(children, target);
}

Portal.displayName = "Portal";
