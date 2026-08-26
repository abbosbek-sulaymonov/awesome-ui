import { Button, Card } from "@abek/awesome-ui";

export default function CardBasic() {
  return (
    <Card.Root style={{ maxWidth: "24rem" }}>
      <Card.Header>
        <Card.Title>Deploy to production</Card.Title>
        <Card.Description>Runs the full test suite first.</Card.Description>
      </Card.Header>
      <Card.Footer>
        <Button size="sm">Deploy</Button>
        <Button size="sm" variant="ghost">Cancel</Button>
      </Card.Footer>
    </Card.Root>
  );
}
