import { Alert } from "@abek/awesome-ui";

export default function AlertTones() {
  return (
    <div style={{ display: "grid", gap: "var(--aui-space-3)", width: "100%" }}>
      <Alert tone="info" title="Heads up">A new version is available.</Alert>
      <Alert tone="success" title="Saved">Your changes are live.</Alert>
      <Alert tone="warning" title="Approaching limit">You have used 90% of your quota.</Alert>
      <Alert tone="danger" title="Could not save">The server did not respond.</Alert>
    </div>
  );
}
