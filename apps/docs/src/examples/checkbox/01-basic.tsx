import { Checkbox } from "@abek/awesome-ui";

export default function CheckboxBasic() {
  return (
    <div style={{ display: "grid", gap: "var(--aui-space-3)" }}>
      <Checkbox label="Accept terms" description="You can revoke this later." />
      <Checkbox label="Checked by default" defaultChecked />
      <Checkbox label="Unavailable" disabled />
      <Checkbox label="Invalid" errorMessage="You must accept to continue." />
    </div>
  );
}
