import { Collapsible } from "@abek/awesome-ui";

export default function CollapsibleBasic() {
  return (
    <div style={{ width: "100%", maxWidth: "28rem" }}>
      <Collapsible.Root>
        <Collapsible.Trigger
          style={{ padding: "var(--aui-space-3)", fontWeight: "var(--aui-weight-medium)" }}
        >
          Advanced settings
        </Collapsible.Trigger>
        <Collapsible.Panel>
          <div style={{ padding: "0 var(--aui-space-3) var(--aui-space-3)", color: "var(--aui-color-fg-muted)" }}>
            One disclosure, no group. Height animates from a measured value, since
            <code> height: auto </code> is not animatable.
          </div>
        </Collapsible.Panel>
      </Collapsible.Root>
    </div>
  );
}
