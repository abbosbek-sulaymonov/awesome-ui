export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[]
  | { [key: string]: unknown };

/**
 * Join conditional class names. Falsy values drop out.
 *
 * Deliberately not `clsx` — this keeps the package at zero runtime
 * dependencies, and CSS Modules means we never need Tailwind-style
 * conflict resolution (`tailwind-merge`), only concatenation.
 */
export function cn(...inputs: ClassValue[]): string {
  let out = "";

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === "string" || typeof input === "number") {
      out = out ? `${out} ${input}` : String(input);
      continue;
    }

    if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) out = out ? `${out} ${nested}` : nested;
      continue;
    }

    for (const key in input) {
      if (input[key]) out = out ? `${out} ${key}` : key;
    }
  }

  return out;
}
