import { useState } from "react";
import { Button } from "@abek/awesome-ui";
import { CodeBlock, CopyButton } from "./CodeBlock";
import type { Example as ExampleData } from "../examples";

/**
 * Renders one example: the live component above, its real source below.
 *
 * Both come from the same file, so the snippet can never disagree with the
 * demo — the usual way component docs go stale.
 */
export function Example({
  example,
  layout = "inline",
}: {
  example: ExampleData;
  layout?: "inline" | "block";
}) {
  const [showCode, setShowCode] = useState(false);

  return (
    <div className="example">
      <div className="exampleHeader">
        <span className="exampleTitle">{example.title}</span>
        <div className="exampleActions">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowCode((open) => !open)}
            aria-expanded={showCode}
          >
            {showCode ? "Hide code" : "Show code"}
          </Button>
          <CopyButton value={example.source} />
        </div>
      </div>

      <div className="preview" data-layout={layout}>
        <example.Component />
      </div>

      {showCode ? <CodeBlock code={example.source} /> : null}
    </div>
  );
}
