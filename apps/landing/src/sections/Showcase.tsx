import { useState } from "react";
import {
  Alert, Avatar, AvatarGroup, Badge, Button, Checkbox, Combobox, Dialog, Input,
  Menu, Popover, Progress, Select, Slider, Switch, Tabs, toast, Tooltip,
} from "@abek/awesome-ui";

const frameworks = [
  { value: "react", label: "React" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "Solid" },
  { value: "vue", label: "Vue" },
];

function Actions() {
  return (
    <>
      <Button>Solid</Button>
      <Button variant="soft">Soft</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="danger">Danger</Button>
      <Tooltip.Root openDelay={200}>
        <Tooltip.Trigger asChild>
          <Button variant="ghost">Hover me</Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <Tooltip.Arrow />
          Opens instantly on focus
        </Tooltip.Content>
      </Tooltip.Root>
      <Button variant="soft" onClick={() => toast.success("It works")}>Toast</Button>
    </>
  );
}

function Forms() {
  const [volume, setVolume] = useState(40);

  return (
    <div style={{ display: "grid", gap: "var(--aui-space-4)", width: "100%", maxWidth: "22rem" }}>
      <Input label="Email" type="email" placeholder="you@example.com" />
      <Combobox options={frameworks} label="Framework" placeholder="Search" />
      <Select.Root defaultValue="solid">
        <Select.Trigger label="Renderer">
          <Select.Value placeholder="Pick one" />
        </Select.Trigger>
        <Select.Content>
          {frameworks.map((f) => (
            <Select.Item key={f.value} value={f.value}>{f.label}</Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
      <Slider
        label="Volume"
        showValue
        value={volume}
        onValueChange={(next) => setVolume(next as number)}
        formatValue={(n) => `${n}%`}
      />
      <Checkbox label="Accept terms" description="You can revoke this later." />
      <Switch label="Email alerts" defaultChecked />
    </div>
  );
}

function Overlays() {
  return (
    <>
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <Button variant="outline">Dialog</Button>
        </Dialog.Trigger>
        <Dialog.Overlay />
        <Dialog.Content size="sm">
          <Dialog.Header>
            <Dialog.Title>Focus is trapped here</Dialog.Title>
            <Dialog.Description>
              Tab cycles inside, Escape closes, and focus returns to the button you came
              from.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Dialog.Close asChild><Button variant="ghost">Close</Button></Dialog.Close>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>

      <Popover.Root>
        <Popover.Trigger asChild>
          <Button variant="outline">Popover</Button>
        </Popover.Trigger>
        <Popover.Content aria-label="Example popover">
          <Popover.Arrow />
          <strong>Anchored positioning</strong>
          <p style={{ margin: "var(--aui-space-2) 0 0" }}>
            Flips and shifts to stay on screen. Scroll the page to see it.
          </p>
        </Popover.Content>
      </Popover.Root>

      <Menu.Root>
        <Menu.Trigger asChild>
          <Button variant="outline">Menu</Button>
        </Menu.Trigger>
        <Menu.Content label="Actions">
          <Menu.Item shortcut="⌘N">New file</Menu.Item>
          <Menu.Item shortcut="⌘D">Duplicate</Menu.Item>
          <Menu.Separator />
          <Menu.Item danger>Delete</Menu.Item>
        </Menu.Content>
      </Menu.Root>
    </>
  );
}

function Display() {
  return (
    <div style={{ display: "grid", gap: "var(--aui-space-5)", width: "100%" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--aui-space-2)" }}>
        <Badge tone="accent">Accent</Badge>
        <Badge tone="success" dot>Live</Badge>
        <Badge tone="warning" variant="outline">Deprecated</Badge>
        <Badge tone="danger" variant="solid">Failed</Badge>
      </div>

      <AvatarGroup max={4}>
        <Avatar name="Ada Lovelace" />
        <Avatar name="Grace Hopper" />
        <Avatar name="Alan Turing" />
        <Avatar name="Katherine Johnson" />
        <Avatar name="Barbara Liskov" />
      </AvatarGroup>

      <Progress value={72} label="Upload" showValue />
      <Alert tone="success" title="Saved">Everything on this page is the real library.</Alert>
    </div>
  );
}

const PANELS = [
  { value: "actions", label: "Actions", node: <Actions />, layout: "inline" as const },
  { value: "forms", label: "Forms", node: <Forms />, layout: "block" as const },
  { value: "overlays", label: "Overlays", node: <Overlays />, layout: "inline" as const },
  { value: "display", label: "Display", node: <Display />, layout: "block" as const },
];

/**
 * Live components, not screenshots.
 *
 * Everything below is imported from the published entry point, so the section
 * is both the demonstration and a standing check that the library works outside
 * its own test suite.
 */
export function Showcase() {
  return (
    <section className="section" id="components">
      <div className="container">
        <div className="sectionHead">
          <span className="eyebrow">Live, not screenshots</span>
          <h2 className="sectionTitle">Try it right here</h2>
          <p className="sectionLead">
            Every control below is the real component. Open a dialog and press Escape, tab
            through a menu, or drag the slider with the arrow keys.
          </p>
        </div>

        <div className="showcase">
          <Tabs.Root defaultValue="actions">
            <div className="tabsBar">
              <Tabs.List label="Component groups">
                {PANELS.map((panel) => (
                  <Tabs.Trigger key={panel.value} value={panel.value}>{panel.label}</Tabs.Trigger>
                ))}
              </Tabs.List>
            </div>

            {PANELS.map((panel) => (
              <Tabs.Panel key={panel.value} value={panel.value}>
                <div className="showcaseStage" data-layout={panel.layout}>{panel.node}</div>
              </Tabs.Panel>
            ))}
          </Tabs.Root>

          <p className="showcaseNote">
            Rendered from <code>@abek/awesome-ui</code> — the same build published to npm.
          </p>
        </div>
      </div>
    </section>
  );
}
