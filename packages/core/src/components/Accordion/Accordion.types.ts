import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type AccordionVariant = "outline" | "separated" | "plain";

interface AccordionSharedProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange" | "defaultValue"> {
  children?: ReactNode;
  /** @default "outline" */
  variant?: AccordionVariant | undefined;
  /** Allow closing the only open item. Ignored when `type` is "multiple". */
  collapsible?: boolean | undefined;
  disabled?: boolean | undefined;
}

export interface AccordionSingleProps extends AccordionSharedProps {
  /** @default "single" */
  type?: "single" | undefined;
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
}

export interface AccordionMultipleProps extends AccordionSharedProps {
  type: "multiple";
  value?: string[] | undefined;
  defaultValue?: string[] | undefined;
  onValueChange?: ((value: string[]) => void) | undefined;
}

export type AccordionRootProps = AccordionSingleProps | AccordionMultipleProps;

export interface AccordionItemProps extends ComponentPropsWithoutRef<"div"> {
  value: string;
  disabled?: boolean | undefined;
}

export interface AccordionTriggerProps extends ComponentPropsWithoutRef<"button"> {
  /** Heading level the trigger sits under. @default 3 */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6 | undefined;
}

export interface AccordionPanelProps extends ComponentPropsWithoutRef<"div"> {
  /** Keep the panel mounted while closed, so its state survives. */
  keepMounted?: boolean | undefined;
}
