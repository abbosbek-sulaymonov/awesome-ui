import { useState } from "react";
import { Alert, Button } from "@abek/awesome-ui";

export default function AlertActions() {
  const [visible, setVisible] = useState(true);

  return (
    <div style={{ display: "grid", gap: "var(--aui-space-3)", width: "100%" }}>
      <Alert
        variant="outline"
        tone="danger"
        title="Deployment failed"
        actions={<Button size="sm" variant="danger">Retry</Button>}
      >
        Build step exited with code 1.
      </Alert>

      {visible ? (
        <Alert tone="info" title="Dismissible" onDismiss={() => setVisible(false)}>
          Close this one with the button on the right.
        </Alert>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => setVisible(true)}>
          Bring it back
        </Button>
      )}
    </div>
  );
}
