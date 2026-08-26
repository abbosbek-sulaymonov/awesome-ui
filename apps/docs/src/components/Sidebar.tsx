import { groups, pages } from "../pages";

export function Sidebar({ route, onNavigate }: { route: string; onNavigate: () => void }) {
  return (
    <nav id="docs-sidebar" className="sidebar" aria-label="Documentation">
      <div className="sidebarInner">
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
      </div>
    </nav>
  );
}
