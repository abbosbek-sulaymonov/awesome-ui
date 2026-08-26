import { useState } from "react";
import { Checkbox } from "@abek/awesome-ui";

// A parent whose children disagree is neither checked nor unchecked.
export default function CheckboxIndeterminate() {
  const [items, setItems] = useState([true, false, false]);

  const allChecked = items.every(Boolean);
  const someChecked = items.some(Boolean) && !allChecked;

  return (
    <div style={{ display: "grid", gap: "var(--aui-space-2)" }}>
      <Checkbox
        label="Select all"
        checked={allChecked}
        indeterminate={someChecked}
        onCheckedChange={(checked) => setItems(items.map(() => checked))}
      />
      <div style={{ display: "grid", gap: "var(--aui-space-2)", paddingInlineStart: "var(--aui-space-6)" }}>
        {items.map((checked, index) => (
          <Checkbox
            key={index}
            label={`Item ${index + 1}`}
            checked={checked}
            onCheckedChange={(next) =>
              setItems(items.map((value, i) => (i === index ? next : value)))
            }
          />
        ))}
      </div>
    </div>
  );
}
