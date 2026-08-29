import { NumberInput } from "@abek/awesome-ui";

export default function NumberInputBasic() {
  return (
    <div style={{ display: "grid", gap: "var(--aui-space-4)", maxWidth: "16rem" }}>
      <NumberInput label="Quantity" defaultValue={1} min={0} max={20} />
      {/* Precision is inferred from the step, so this rounds to one place. */}
      <NumberInput label="Rating" defaultValue={3.5} min={0} max={5} step={0.5} />
      <NumberInput label="No steppers" defaultValue={42} hideSteppers />
      <NumberInput label="Disabled" defaultValue={7} disabled />
    </div>
  );
}
