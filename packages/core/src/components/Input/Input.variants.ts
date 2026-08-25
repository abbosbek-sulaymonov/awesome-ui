import { createVariants } from "../../utils/variants";
import styles from "./Input.module.css";

export const inputWrapperVariants = createVariants({
  base: styles.wrapper,
  variants: {
    variant: {
      outline: undefined,
      filled: styles.filled,
      flushed: styles.flushed,
    },
    size: {
      sm: styles.sm,
      md: styles.md,
      lg: styles.lg,
    },
  },
  defaultVariants: { variant: "outline", size: "md" },
});
