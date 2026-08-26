import { Children, cloneElement, forwardRef, isValidElement, useEffect, useState } from "react";
import type { ReactElement } from "react";
import { VisuallyHidden } from "../../primitives/VisuallyHidden";
import { cn } from "../../utils/cn";
import styles from "./Avatar.module.css";
import type { AvatarGroupProps, AvatarProps, AvatarSize } from "./Avatar.types";

/**
 * First letter of the first and last word — "Ada Lovelace" becomes "AL".
 * Uses the spread operator rather than charAt so that names beginning with an
 * emoji or an astral-plane character do not get sliced through a surrogate pair.
 */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";

  const first = [...words[0]!][0] ?? "";
  const last = words.length > 1 ? ([...words[words.length - 1]!][0] ?? "") : "";

  return (first + last).toUpperCase();
}

/**
 * Stable hash so the same name always gets the same tint, across reloads and
 * across machines. Math.random would reshuffle colours on every render.
 */
function toneFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % 5;
  return styles[`tone${index}`] ?? "";
}

type LoadState = "idle" | "loading" | "loaded" | "error";

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  {
    size = "md",
    square,
    src,
    name,
    initials,
    fallback,
    status,
    statusLabel,
    monochrome,
    className,
    children,
    ...rest
  },
  ref,
) {
  const [loadState, setLoadState] = useState<LoadState>(src ? "loading" : "idle");

  // Reset when the source changes, or a failed avatar would stay broken after
  // the URL is corrected.
  useEffect(() => {
    setLoadState(src ? "loading" : "idle");
  }, [src]);

  const showImage = Boolean(src) && loadState !== "error";
  const derivedInitials = initials ?? (name ? getInitials(name) : "");
  const tone = monochrome || !name ? "" : toneFor(name);

  return (
    <span
      ref={ref}
      className={cn(styles.root, styles[size], square && styles.square, !showImage && tone, className)}
      data-size={size}
      data-status={status}
      {...rest}
    >
      {showImage ? (
        <img
          className={styles.image}
          src={src}
          // A decorative alt would leave a screen reader announcing nothing for
          // a face; the name is the whole point of the element.
          alt={name ?? ""}
          onLoad={() => setLoadState("loaded")}
          onError={() => setLoadState("error")}
        />
      ) : (
        <span className={styles.fallback} aria-hidden={name ? undefined : "true"}>
          {fallback ?? children ?? derivedInitials}
        </span>
      )}

      {/* Initials are an abbreviation; the full name has to reach assistive
          tech even when no image rendered. */}
      {!showImage && name && !fallback ? <VisuallyHidden>{name}</VisuallyHidden> : null}

      {status ? (
        <>
          <span className={cn(styles.status, styles[status])} aria-hidden="true" />
          <VisuallyHidden>{statusLabel ?? status}</VisuallyHidden>
        </>
      ) : null}
    </span>
  );
});

Avatar.displayName = "Avatar";

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup(
  { max, size = "md", className, children, ...rest },
  ref,
) {
  const items = Children.toArray(children).filter(isValidElement);
  const visible = max === undefined ? items : items.slice(0, max);
  const hidden = items.length - visible.length;

  return (
    <div ref={ref} className={cn(styles.group, className)} {...rest}>
      {visible.map((child) =>
        // The group owns sizing, so every avatar in it matches without the
        // consumer repeating the prop.
        cloneElement(child as ReactElement<{ size?: AvatarSize }>, { size }),
      )}
      {hidden > 0 ? (
        <span
          className={cn(styles.root, styles[size], styles.overflow)}
          role="img"
          aria-label={`${hidden} more`}
        >
          +{hidden}
        </span>
      ) : null}
    </div>
  );
});

AvatarGroup.displayName = "AvatarGroup";
