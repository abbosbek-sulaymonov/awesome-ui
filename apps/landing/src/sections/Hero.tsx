import { useState } from "react";
import { Badge, Button, toast } from "@abek/awesome-ui";
import { ArrowIcon, CheckIcon, CopyIcon, GitHubIcon } from "./Icons";
import { DOCS_URL, INSTALL_COMMAND, REPO_URL, VERSION } from "../content";

function InstallCommand() {
  const [copied, setCopied] = useState(false);

  return (
    <div className="install">
      <span className="installPrompt" aria-hidden="true">$</span>
      <code>{INSTALL_COMMAND}</code>
      <Button
        size="sm"
        variant="ghost"
        iconOnly
        aria-label={copied ? "Copied" : "Copy install command"}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(INSTALL_COMMAND);
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
      </Button>
    </div>
  );
}

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="heroGlow" aria-hidden="true" />
      <div className="container heroInner">
        <Badge tone="accent" variant="soft">
          v{VERSION} · MIT · zero runtime dependencies
        </Badge>

        <h1 className="heroTitle">
          Accessible React components,{" "}
          <span className="gradient">without the config</span>
        </h1>

        <p className="heroLead">
          33 components built on hand-written primitives — focus management, anchored
          positioning, roving focus. CSS Modules and design tokens, so there is nothing to
          set up and nothing to fight.
        </p>

        <div className="heroActions">
          <Button asChild size="lg" endIcon={<ArrowIcon />}>
            <a href={DOCS_URL}>Get started</a>
          </Button>
          <Button asChild size="lg" variant="outline" startIcon={<GitHubIcon />}>
            <a href={REPO_URL} target="_blank" rel="noreferrer">GitHub</a>
          </Button>
        </div>

        <InstallCommand />
      </div>
    </section>
  );
}
