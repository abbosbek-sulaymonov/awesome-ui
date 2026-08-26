import { useCallback, useEffect, useState } from "react";

/**
 * Hash routing, hand-rolled.
 *
 * A router dependency would be the docs site's largest package by far, for a
 * flat list of pages with no params, no nesting and no data loading. Hashes
 * also mean the built site works from any static host without rewrite rules —
 * which is what GitHub Pages gives you.
 */

function read(): string {
  if (typeof window === "undefined") return "";
  return window.location.hash.replace(/^#\/?/, "");
}

export function useRoute(): [string, (path: string) => void] {
  const [route, setRoute] = useState(read);

  useEffect(() => {
    const onChange = () => setRoute(read());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const navigate = useCallback((path: string) => {
    window.location.hash = `/${path}`;
    // Landing halfway down the previous page is disorienting.
    window.scrollTo({ top: 0 });
  }, []);

  return [route, navigate];
}
