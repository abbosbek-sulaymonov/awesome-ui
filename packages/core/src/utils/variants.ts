/**
 * Minimal, fully typed variant resolver for CSS Modules.
 *
 * `cva` assumes utility class strings; with CSS Modules the class names come
 * out of an imported `styles` object, so the recipe maps prop values onto
 * those keys instead.
 *
 *   const button = createVariants({
 *     base: styles.root,
 *     variants: {
 *       variant: { solid: styles.solid, ghost: styles.ghost },
 *       size:    { sm: styles.sm, md: styles.md },
 *     },
 *     defaultVariants: { variant: "solid", size: "md" },
 *   });
 *
 *   button({ variant: "ghost" }) // "aui-root-x1y2z aui-ghost-a1b2c aui-md-q9w8e"
 */
import { cn } from "./cn";

export type VariantShape = Record<string, Record<string, string | undefined>>;

export type VariantProps<T extends VariantShape> = {
  [K in keyof T]?: keyof T[K] | null | undefined;
};

export type CompoundVariant<T extends VariantShape> = VariantProps<T> & {
  className: string | undefined;
};

export interface VariantConfig<T extends VariantShape> {
  base?: string | undefined;
  variants: T;
  defaultVariants?: VariantProps<T>;
  /** Extra classes applied only when every listed variant matches. */
  compoundVariants?: CompoundVariant<T>[];
}

export type VariantResolver<T extends VariantShape> = (
  props?: VariantProps<T> & { className?: string | undefined },
) => string;

export function createVariants<T extends VariantShape>(
  config: VariantConfig<T>,
): VariantResolver<T> {
  const { base, variants, defaultVariants = {}, compoundVariants = [] } = config;

  return function resolve(props = {}) {
    const { className } = props;

    // Only ever read declared variant keys, so unrelated props (className and
    // anything a caller spreads through) can never leak into the lookup.
    const resolved = { ...defaultVariants } as VariantProps<T>;
    for (const key in variants) {
      const value = props[key];
      // `undefined` falls through to the default; `null` explicitly opts out.
      if (value !== undefined) resolved[key] = value;
    }

    const classes: string[] = [];
    if (base) classes.push(base);

    for (const key in variants) {
      const value = resolved[key];
      if (value === null || value === undefined) continue;
      const match = variants[key]?.[value as string];
      if (match) classes.push(match);
    }

    for (const compound of compoundVariants) {
      if (!compound.className) continue;

      let matches = true;
      for (const key in variants) {
        const expected = compound[key];
        if (expected === undefined) continue;
        if (resolved[key] !== expected) {
          matches = false;
          break;
        }
      }
      if (matches) classes.push(compound.className);
    }

    return cn(classes, className);
  };
}
