import { useState } from "react";
import { Button } from "@abek/awesome-ui";

export default function ButtonLoading() {
  const [saving, setSaving] = useState(false);

  return (
    <>
      <Button
        loading={saving}
        onClick={() => {
          setSaving(true);
          setTimeout(() => setSaving(false), 1800);
        }}
      >
        Save changes
      </Button>
      <Button loading>Always loading</Button>
      <Button disabled>Disabled</Button>
    </>
  );
}
