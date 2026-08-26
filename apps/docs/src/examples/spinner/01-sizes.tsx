import { Button, Spinner } from "@abek/awesome-ui";

export default function SpinnerSizes() {
  return (
    <>
      <Spinner size="xs" />
      <Spinner size="sm" />
      <Spinner size="md" tone="accent" />
      <Spinner size="lg" tone="muted" />
      <Button loading>Inside a button</Button>
    </>
  );
}
