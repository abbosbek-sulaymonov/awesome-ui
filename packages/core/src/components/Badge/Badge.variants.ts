import { createVariants } from "../../utils/variants";
import styles from "./Badge.module.css";

export const badgeVariants = createVariants({
  base: styles.root,
  variants: {
    variant: { solid: styles.solid, soft: styles.soft, outline: styles.outline },
    tone: {
      neutral: styles.neutral,
      accent: styles.accent,
      success: styles.success,
      warning: styles.warning,
      danger: styles.danger,
    },
    size: { sm: styles.sm, md: styles.md, lg: styles.lg },
    square: { true: styles.square, false: undefined },
  },
  defaultVariants: { variant: "soft", tone: "neutral", size: "md", square: "false" },
});
