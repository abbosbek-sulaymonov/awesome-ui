import { Card, toast } from "@abek/awesome-ui";

// `interactive` supplies the affordance; `asChild` with a real <button> is what
// makes it focusable and operable by keyboard. A div with onClick would be
// neither.
export default function CardInteractive() {
  return (
    <Card.Root asChild interactive style={{ maxWidth: "24rem" }}>
      <button type="button" onClick={() => toast.success("Card activated")}>
        <Card.Header>
          <Card.Title>Pick this plan</Card.Title>
          <Card.Description>Try tabbing to it, then pressing Enter.</Card.Description>
        </Card.Header>
      </button>
    </Card.Root>
  );
}
