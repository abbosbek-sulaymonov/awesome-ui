import { useState } from "react";
import { CodeBlock, CopyButton } from "./CodeBlock";
import { CodeIcon } from "./Icons";
import type { Example as ExampleData } from "../examples";

/**
 * One example: the live component above, its real source below.
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
          <button
            type="button"
            className="iconButton"
            onClick={() => setShowCode((open) => !open)}
            aria-expanded={showCode}
            aria-label={showCode ? "Hide code" : "Show code"}
            title={showCode ? "Hide code" : "Show code"}
            data-active={showCode || undefined}
          >
            <CodeIcon />
          </button>
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
