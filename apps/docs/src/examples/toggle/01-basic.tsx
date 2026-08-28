import { Toggle, ToggleGroup } from "@abek/awesome-ui";

export default function ToggleBasic() {
  return (
    <div style={{ display: "grid", gap: "var(--aui-space-5)" }}>
      <div style={{ display: "flex", gap: "var(--aui-space-2)" }}>
        <Toggle variant="outline">Bold</Toggle>
        <Toggle variant="outline" defaultPressed>Italic</Toggle>
        <Toggle variant="outline" disabled>Underline</Toggle>
      </div>

      {/* Single selection, joined into one control. */}
      <ToggleGroup label="Alignment" defaultValue="left">
        <Toggle value="left">Left</Toggle>
        <Toggle value="center">Center</Toggle>
        <Toggle value="right">Right</Toggle>
      </ToggleGroup>

      {/* Several at once. */}
      <ToggleGroup type="multiple" label="Formatting" defaultValue={["bold"]}>
        <Toggle value="bold">B</Toggle>
        <Toggle value="italic">I</Toggle>
        <Toggle value="underline">U</Toggle>
      </ToggleGroup>
    </div>
  );
}
