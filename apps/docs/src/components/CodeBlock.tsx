import { useState } from "react";
import { Button, toast } from "@abek/awesome-ui";

export function CodeBlock({ code, language = "tsx" }: { code: string; language?: string }) {
  return (
    <pre className="codeBlock" tabIndex={0} aria-label={`${language} code`}>
      <code>{code}</code>
    </pre>
  );
}

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // Clipboard access is denied in some contexts; say so rather than
          // leaving the button looking broken.
          toast.error("Could not copy to clipboard");
        }
      }}
    >
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}
