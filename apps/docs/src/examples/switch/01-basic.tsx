import { Switch } from "@abek/awesome-ui";

export default function SwitchBasic() {
  return (
    <div style={{ display: "grid", gap: "var(--aui-space-3)", maxWidth: "24rem" }}>
      <Switch label="Email alerts" description="Sent at most once a day." defaultChecked />
      <Switch label="Push notifications" labelFirst />
      <Switch label="Beta features" disabled />
    </div>
  );
}
