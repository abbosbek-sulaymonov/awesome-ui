import { Progress } from "@abek/awesome-ui";

export default function ProgressBasic() {
  return (
    <div style={{ display: "grid", gap: "var(--aui-space-5)", width: "100%", maxWidth: "28rem" }}>
      <Progress value={72} label="Upload" showValue />
      <Progress value={3} max={8} label="Files" valueLabel="3 of 8 files" showValue />
      <Progress value={94} label="Storage" tone="warning" showValue />
      {/* No value means the total is unknown, not that nothing has happened. */}
      <Progress label="Working" />
    </div>
  );
}
