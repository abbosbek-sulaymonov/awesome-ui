import { useState } from "react";
import { Button, toast } from "@abek/awesome-ui";
import { tokenize } from "@awesome-ui/highlight";
import { CheckIcon, CopyIcon } from "./Icons";
import { EXAMPLE_CODE, principles } from "../content";

function Code({ source }: { source: string }) {
  return (
    <pre className="code" tabIndex={0} aria-label="tsx example">
      <code>
        {tokenize(source, "tsx").map((token, index) =>
          token.type === "plain" ? (
            token.value
          ) : (
            <span key={index} className={`tok-${token.type}`}>{token.value}</span>
          ),
        )}
      </code>
    </pre>
  );
}

export function CodeExample() {
  const [copied, setCopied] = useState(false);

  return (
    <section className="section" id="install">
      <div className="container split">
        <div className="splitCopy">
          <span className="eyebrow">One import away</span>
          <h2 className="splitTitle">Predictable, on purpose</h2>
          <p className="splitBody">
            Every component follows the same contract, so the second one you use behaves
            like the first.
          </p>

          <ul className="checkList">
            {principles.map((line) => (
              <li className="checkItem" key={line}>
                <CheckIcon className="checkIcon" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="codePanel">
          <div className="codeHead">
            <span>App.tsx</span>
            <Button
              size="sm"
              variant="ghost"
              iconOnly
              aria-label={copied ? "Copied" : "Copy example"}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(EXAMPLE_CODE);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                } catch {
                  toast.error("Could not copy to clipboard");
                }
              }}
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
            </Button>
          </div>
          <Code source={EXAMPLE_CODE} />
        </div>
      </div>
    </section>
  );
}
