import { Input } from "@abek/awesome-ui";

export default function InputBasic() {
  return (
    <div style={{ display: "grid", gap: "var(--aui-space-4)", maxWidth: "24rem" }}>
      <Input label="Email" type="email" placeholder="you@example.com" />
      <Input label="Filled" variant="filled" placeholder="Filled variant" />
      <Input label="Flushed" variant="flushed" placeholder="Flushed variant" />
      <Input label="Disabled" placeholder="Disabled" disabled />
    </div>
  );
}
