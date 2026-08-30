import { Button, useTheme } from "@abek/awesome-ui";
import { GitHubIcon, MoonIcon, SunIcon } from "./Icons";
import { REPO_URL, DOCS_URL } from "../content";

export function Nav() {
  const { colorScheme, toggle } = useTheme();
  const next = colorScheme === "dark" ? "light" : "dark";

  return (
    <header className="nav">
      <div className="container navInner">
        <a className="brand" href="#top">
          <span className="brandMark" aria-hidden="true">aui</span>
          <span className="brandName">awesome-ui</span>
        </a>

        <nav className="navLinks" aria-label="Main">
          <a className="navLink" href="#features">Features</a>
          <a className="navLink" href="#components">Components</a>
          <a className="navLink" href="#install">Install</a>

          <a
            className="iconLink"
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="View source on GitHub"
          >
            <GitHubIcon />
          </a>

          <button
            type="button"
            className="iconLink"
            onClick={toggle}
            // Names the outcome of pressing, which is what a screen-reader user
            // needs before they press rather than after.
            aria-label={`Switch to ${next} mode`}
            title={`Switch to ${next} mode`}
          >
            {colorScheme === "dark" ? <SunIcon width={18} height={18} /> : <MoonIcon width={18} height={18} />}
          </button>

          <Button asChild size="sm">
            <a href={DOCS_URL}>Documentation</a>
          </Button>
        </nav>
      </div>
    </header>
  );
}
