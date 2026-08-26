import { Textarea } from "@abek/awesome-ui";

export default function TextareaBasic() {
  return (
    <div style={{ display: "grid", gap: "var(--aui-space-4)", maxWidth: "28rem" }}>
      <Textarea label="Bio" placeholder="Tell us about yourself" description="Keep it short." />
      <Textarea label="Filled" variant="filled" placeholder="Filled variant" />
      <Textarea label="Disabled" placeholder="Disabled" disabled />
    </div>
  );
}
