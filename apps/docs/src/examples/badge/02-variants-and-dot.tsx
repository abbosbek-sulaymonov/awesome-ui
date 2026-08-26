import { Badge } from "@abek/awesome-ui";

export default function BadgeVariants() {
  return (
    <>
      <Badge variant="solid" tone="accent">Solid</Badge>
      <Badge variant="soft" tone="accent">Soft</Badge>
      <Badge variant="outline" tone="accent">Outline</Badge>
      <Badge tone="success" dot>Live</Badge>
      <Badge tone="accent" square srLabel="3 unread messages">3</Badge>
    </>
  );
}
