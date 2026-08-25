import type { ComponentPropsWithoutRef, ElementType, ReactElement, Ref } from "react";

/**
 * Types for components that can render as a different element via `as`,
 * or hand their props to their own child via `asChild`.
 */

/** Props of `E`, minus anything the component itself owns. */
export type PropsOf<E extends ElementType> = ComponentPropsWithoutRef<E>;

export type AsProp<E extends ElementType> = { as?: E };

export type PolymorphicProps<E extends ElementType, OwnProps = object> = OwnProps &
  AsProp<E> &
  Omit<PropsOf<E>, keyof OwnProps | "as">;

export type PolymorphicPropsWithRef<
  E extends ElementType,
  OwnProps = object,
> = PolymorphicProps<E, OwnProps> & { ref?: Ref<ElementRefOf<E>> };

export type ElementRefOf<E extends ElementType> = E extends keyof HTMLElementTagNameMap
  ? HTMLElementTagNameMap[E]
  : Element;

/**
 * Callable signature for a polymorphic component, so the return type of `as`
 * stays correct at the call site.
 */
export interface PolymorphicComponent<
  DefaultElement extends ElementType,
  OwnProps = object,
> {
  <E extends ElementType = DefaultElement>(
    props: PolymorphicPropsWithRef<E, OwnProps>,
  ): ReactElement | null;
  displayName?: string | undefined;
}

/** Opt into rendering the single child instead of the default element. */
export interface AsChildProps {
  /**
   * Merge this component's props and behavior onto its only child instead of
   * rendering the default element.
   *
   *   <Button asChild><a href="/docs">Docs</a></Button>
   */
  asChild?: boolean;
}
