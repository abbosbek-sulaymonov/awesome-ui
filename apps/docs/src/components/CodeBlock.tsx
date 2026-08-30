import { useState } from "react";
import { toast } from "@abek/awesome-ui";
import { tokenize } from "@awesome-ui/highlight";
import type { Language } from "@awesome-ui/highlight";
import { CheckIcon, CopyIcon } from "./Icons";

export function CodeBlock({
  code,
  language = "tsx",
}: {
  code: string;
  language?: Language;
}) {
  const tokens = tokenize(code, language);

  return (
    <pre className="codeBlock" tabIndex={0} aria-label={`${language} code`}>
      <code>
        {tokens.map((token, index) =>
          token.type === "plain" ? (
            token.value
          ) : (
            <span key={index} className={`tok-${token.type}`}>
              {token.value}
            </span>
          ),
        )}
      </code>
    </pre>
  );
}

export function CopyButton({ value, label = "Copy code" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="iconButton"
      aria-label={copied ? "Copied" : label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // Clipboard access is denied in some contexts; say so rather than
          // leaving the button looking inert.
          toast.error("Could not copy to clipboard");
        }
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
}
