import { Separator } from "@abek/awesome-ui";

export default function SeparatorBasic() {
  return (
    <div style={{ display: "grid", gap: "var(--aui-space-4)", width: "100%", maxWidth: "28rem" }}>
      <span>Above</span>
      <Separator />
      <span>Below</span>
      <Separator label="or" />
      <div style={{ display: "flex", alignItems: "center", gap: "var(--aui-space-3)", height: "2rem" }}>
        <span>Left</span>
        <Separator orientation="vertical" />
        <span>Right</span>
      </div>
    </div>
  );
}
