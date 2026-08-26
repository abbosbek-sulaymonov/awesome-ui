import type { ComponentPropsWithoutRef } from "react";
import type { AsChildProps } from "../../types/polymorphic";

export type CardVariant = "outline" | "elevated" | "filled" | "ghost";
export type CardPadding = "sm" | "md" | "lg";

export interface CardRootProps extends AsChildProps, ComponentPropsWithoutRef<"div"> {
  /** @default "outline" */
  variant?: CardVariant | undefined;
  /** Padding scale applied to every section. @default "md" */
  padding?: CardPadding | undefined;
  /**
   * Hover and press affordances. Pair with `asChild` and a real `<button>` or
   * `<a>` — this prop styles, it does not make a div focusable.
   */
  interactive?: boolean | undefined;
}

export interface CardHeaderProps extends ComponentPropsWithoutRef<"div"> {}
export interface CardTitleProps extends ComponentPropsWithoutRef<"h3"> {}
export interface CardDescriptionProps extends ComponentPropsWithoutRef<"p"> {}
export interface CardBodyProps extends ComponentPropsWithoutRef<"div"> {}
export interface CardFooterProps extends ComponentPropsWithoutRef<"div"> {}
export interface CardMediaProps extends ComponentPropsWithoutRef<"figure"> {}
