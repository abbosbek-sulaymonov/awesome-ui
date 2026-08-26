import { SidebarIcon } from "./Icons";
import { ThemeToggle } from "./ThemeToggle";
import { GitHubIcon } from "./Icons";

export function Topbar({
  sidebarOpen,
  onToggleSidebar,
}: {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}) {
  return (
    <header className="topbar">
      <div className="topbarLeft">
        <button
          type="button"
          className="iconButton"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          aria-expanded={sidebarOpen}
          aria-controls="docs-sidebar"
        >
          <SidebarIcon />
        </button>

        <a className="brand" href="#/">
          <span className="brandMark" aria-hidden="true">
            aui
          </span>
          <span className="brandName">awesome-ui</span>
        </a>
      </div>

      <div className="topbarRight">
        <a
          className="iconButton"
          href="https://github.com/abbosbek-sulaymonov/awesome-ui"
          target="_blank"
          rel="noreferrer"
          aria-label="View on GitHub"
        >
          <GitHubIcon />
        </a>
        <ThemeToggle />
      </div>
    </header>
  );
}
