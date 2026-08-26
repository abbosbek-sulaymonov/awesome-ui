import { useState } from "react";
import { Button, ThemeProvider, Toaster, useTheme } from "@abek/awesome-ui";
import { PageBody, groups, pages } from "./pages";
import { useRoute } from "./router";

function ThemeToggle() {
  const { colorScheme, toggle } = useTheme();

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={toggle}
      aria-label={`Switch to ${colorScheme === "dark" ? "light" : "dark"} mode`}
    >
      {colorScheme === "dark" ? "Light" : "Dark"}
    </Button>
  );
}

function Sidebar({
  route,
  open,
  onNavigate,
}: {
  route: string;
  open: boolean;
  onNavigate: () => void;
}) {
  return (
    <nav className="sidebar" data-open={open} aria-label="Documentation">
      <div className="brand">
        <span className="brandName">awesome-ui</span>
        <ThemeToggle />
      </div>

      {groups.map((group) => {
        const inGroup = pages.filter((page) => page.group === group);
        if (inGroup.length === 0) return null;

        return (
          <div className="navGroup" key={group}>
            <div className="navHeading">{group}</div>
            {inGroup.map((page) => (
              <a
                key={page.slug}
                className="navLink"
                href={`#/${page.slug}`}
                aria-current={route === page.slug ? "page" : undefined}
                onClick={onNavigate}
              >
                {page.title}
              </a>
            ))}
          </div>
        );
      })}
    </nav>
  );
}

function NotFound({ route }: { route: string }) {
  return (
    <>
      <h1 className="pageTitle">Not found</h1>
      <p className="pageLead">
        No page at <code className="inlineCode">/{route}</code>.
      </p>
      <a href="#/">Back to the introduction</a>
    </>
  );
}

export function App() {
  const [route] = useRoute();
  const [menuOpen, setMenuOpen] = useState(false);

  const page = pages.find((entry) => entry.slug === route);

  return (
    <ThemeProvider>
      <div className="layout">
        <Sidebar route={route} open={menuOpen} onNavigate={() => setMenuOpen(false)} />

        <main className="main">
          <div className="content">
            <div className="topbar">
              <span className="brandName">awesome-ui</span>
              <div style={{ display: "flex", gap: "var(--aui-space-1)" }}>
                <ThemeToggle />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setMenuOpen((value) => !value)}
                  aria-expanded={menuOpen}
                >
                  {menuOpen ? "Close" : "Menu"}
                </Button>
              </div>
            </div>

            {page ? <PageBody page={page} /> : <NotFound route={route} />}
          </div>
        </main>
      </div>

      <Toaster />
    </ThemeProvider>
  );
}
