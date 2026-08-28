import { Breadcrumb } from "@abek/awesome-ui";

export default function BreadcrumbBasic() {
  return (
    <div style={{ display: "grid", gap: "var(--aui-space-4)" }}>
      <Breadcrumb.Root>
        <Breadcrumb.Link href="#/">Home</Breadcrumb.Link>
        <Breadcrumb.Link href="#/button">Components</Breadcrumb.Link>
        {/* The current page is text, not a link — it goes nowhere. */}
        <Breadcrumb.Link current>Breadcrumb</Breadcrumb.Link>
      </Breadcrumb.Root>

      <Breadcrumb.Root separator="›">
        <Breadcrumb.Link href="#/">Home</Breadcrumb.Link>
        <Breadcrumb.Ellipsis />
        <Breadcrumb.Link current>Deep page</Breadcrumb.Link>
      </Breadcrumb.Root>
    </div>
  );
}
