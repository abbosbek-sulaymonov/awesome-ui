import { createVariants } from "../../utils/variants";
import styles from "./Button.module.css";

export const buttonVariants = createVariants({
  base: styles.root,
  variants: {
    variant: {
      solid: styles.solid,
      soft: styles.soft,
      outline: styles.outline,
      ghost: styles.ghost,
      danger: styles.danger,
      link: styles.link,
    },
    size: {
      sm: styles.sm,
      md: styles.md,
      lg: styles.lg,
    },
    iconOnly: {
      true: styles.iconOnly,
      false: undefined,
    },
  },
  defaultVariants: {
    variant: "solid",
    size: "md",
    iconOnly: "false",
  },
});
