import { useEffect, useState } from "react";
import { ThemeProvider, Toaster } from "@abek/awesome-ui";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { PageBody, pages } from "./pages";
import { useRoute } from "./router";

const SIDEBAR_KEY = "aui-docs-sidebar";

/** Collapsed state is a per-reader preference, so it belongs in their browser. */
function readSidebarPreference(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(SIDEBAR_KEY) !== "collapsed";
  } catch {
    // Private mode or blocked site data — fall back to open.
    return true;
  }
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
  const [sidebarOpen, setSidebarOpen] = useState(readSidebarPreference);

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_KEY, sidebarOpen ? "open" : "collapsed");
    } catch {
      // Not being able to remember the choice is not worth failing over.
    }
  }, [sidebarOpen]);

  const page = pages.find((entry) => entry.slug === route);

  return (
    <ThemeProvider>
      <div className="shell" data-sidebar={sidebarOpen ? "open" : "collapsed"}>
        <Topbar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((v) => !v)} />

        <div className="body">
          <Sidebar
            route={route}
            // On a narrow screen the sidebar overlays the page, so choosing a
            // link should dismiss it rather than leave it covering the answer.
            onNavigate={() => {
              if (window.matchMedia("(max-width: 60rem)").matches) setSidebarOpen(false);
            }}
          />

          {/* Only rendered while the sidebar overlays content, which is
              narrow screens; it is inert at desktop widths. */}
          <button
            type="button"
            className="scrim"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => setSidebarOpen(false)}
          />

          <main className="main">
            <article className="content">
              {page ? <PageBody page={page} /> : <NotFound route={route} />}
            </article>
          </main>
        </div>
      </div>

      <Toaster />
    </ThemeProvider>
  );
}
