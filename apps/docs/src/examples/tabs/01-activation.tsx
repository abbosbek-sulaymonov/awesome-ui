import { Tabs } from "@abek/awesome-ui";

export default function TabsActivation() {
  return (
    <div style={{ display: "grid", gap: "var(--aui-space-8)" }}>
      <Tabs.Root defaultValue="account">
        <Tabs.List label="Automatic activation">
          <Tabs.Trigger value="account">Account</Tabs.Trigger>
          <Tabs.Trigger value="billing">Billing</Tabs.Trigger>
          <Tabs.Trigger value="team" disabled>Team</Tabs.Trigger>
          <Tabs.Trigger value="advanced">Advanced</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="account">Arrow keys switch tabs as focus lands.</Tabs.Panel>
        <Tabs.Panel value="billing">Billing panel.</Tabs.Panel>
        <Tabs.Panel value="team">Team panel.</Tabs.Panel>
        <Tabs.Panel value="advanced">Advanced panel.</Tabs.Panel>
      </Tabs.Root>

      {/* Manual: arrows move focus, Enter commits. Right when a panel costs a fetch. */}
      <Tabs.Root defaultValue="one" variant="enclosed" activation="manual">
        <Tabs.List label="Manual activation">
          <Tabs.Trigger value="one">Manual</Tabs.Trigger>
          <Tabs.Trigger value="two">Activation</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="one">Arrow moves focus; Enter commits.</Tabs.Panel>
        <Tabs.Panel value="two">Second panel.</Tabs.Panel>
      </Tabs.Root>
    </div>
  );
}
