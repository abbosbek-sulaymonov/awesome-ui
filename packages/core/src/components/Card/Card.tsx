import { forwardRef } from "react";
import { Slot } from "../../primitives/Slot";
import { cn } from "../../utils/cn";
import styles from "./Card.module.css";
import type {
  CardBodyProps,
  CardDescriptionProps,
  CardFooterProps,
  CardHeaderProps,
  CardMediaProps,
  CardRootProps,
  CardTitleProps,
} from "./Card.types";

const CardRoot = forwardRef<HTMLDivElement, CardRootProps>(function CardRoot(
  { asChild, variant = "outline", padding = "md", interactive, className, ...rest },
  ref,
) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      ref={ref}
      className={cn(
        styles.root,
        styles[variant],
        styles[padding],
        interactive && styles.interactive,
        className,
      )}
      data-variant={variant}
      data-interactive={interactive || undefined}
      {...rest}
    />
  );
});

CardRoot.displayName = "Card.Root";

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cn(styles.header, className)} {...rest} />;
});

CardHeader.displayName = "Card.Header";

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(function CardTitle(
  { className, ...rest },
  ref,
) {
  // h3 by default: a card is rarely the top of a document outline. Override
  // with `as` semantics by rendering your own heading inside instead.
  return <h3 ref={ref} className={cn(styles.title, className)} {...rest} />;
});

CardTitle.displayName = "Card.Title";

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  function CardDescription({ className, ...rest }, ref) {
    return <p ref={ref} className={cn(styles.description, className)} {...rest} />;
  },
);

CardDescription.displayName = "Card.Description";

const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(function CardBody(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cn(styles.body, className)} {...rest} />;
});

CardBody.displayName = "Card.Body";

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(function CardFooter(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cn(styles.footer, className)} {...rest} />;
});

CardFooter.displayName = "Card.Footer";

const CardMedia = forwardRef<HTMLElement, CardMediaProps>(function CardMedia(
  { className, ...rest },
  ref,
) {
  return <figure ref={ref} className={cn(styles.media, className)} {...rest} />;
});

CardMedia.displayName = "Card.Media";

export const Card = {
  Root: CardRoot,
  Media: CardMedia,
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Body: CardBody,
  Footer: CardFooter,
};

export {
  CardRoot,
  CardMedia,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  CardFooter,
};
