import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type ColorScheme = "light" | "dark";
export type ThemeMode = ColorScheme | "system";

export interface ThemeContextValue {
  /** What the app asked for, including "system". */
  mode: ThemeMode;
  /** What is actually painted right now. */
  colorScheme: ColorScheme;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children?: ReactNode;
  /** Controlled mode. Omit to let the provider own it. */
  mode?: ThemeMode | undefined;
  defaultMode?: ThemeMode | undefined;
  onModeChange?: ((mode: ThemeMode) => void) | undefined;
  /** Element that receives `data-theme`. Defaults to `document.documentElement`. */
  target?: HTMLElement | null | undefined;
  /** Persist the choice under this localStorage key. Pass `null` to disable. */
  storageKey?: string | null | undefined;
}

const QUERY = "(prefers-color-scheme: dark)";

function readStored(key: string | null | undefined): ThemeMode | null {
  if (!key || typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(key);
    return value === "light" || value === "dark" || value === "system" ? value : null;
  } catch {
    // Private mode, blocked site data — fall back to the default.
    return null;
  }
}

/**
 * Owns the color scheme and stamps `data-theme` on the document, which is what
 * the token stylesheet keys off. No context value is needed to style anything —
 * this exists only so app chrome can read and change the current mode.
 */
export function ThemeProvider({
  children,
  mode: controlledMode,
  defaultMode = "system",
  onModeChange,
  target,
  storageKey = "aui-theme",
}: ThemeProviderProps) {
  const [uncontrolledMode, setUncontrolledMode] = useState<ThemeMode>(
    () => readStored(storageKey) ?? defaultMode,
  );
  const [systemScheme, setSystemScheme] = useState<ColorScheme>("light");

  const mode = controlledMode ?? uncontrolledMode;
  const colorScheme: ColorScheme = mode === "system" ? systemScheme : mode;

  // Track the OS preference. Read on mount, not on render, so SSR and the first
  // client render agree.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const media = window.matchMedia(QUERY);
    setSystemScheme(media.matches ? "dark" : "light");

    const onChange = (event: MediaQueryListEvent) => {
      setSystemScheme(event.matches ? "dark" : "light");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const element = target ?? (typeof document !== "undefined" ? document.documentElement : null);
    if (!element) return;

    if (mode === "system") element.removeAttribute("data-theme");
    else element.setAttribute("data-theme", mode);
  }, [mode, target]);

  const setMode = useCallback(
    (next: ThemeMode) => {
      if (controlledMode === undefined) setUncontrolledMode(next);
      onModeChange?.(next);

      if (!storageKey || typeof window === "undefined") return;
      try {
        window.localStorage.setItem(storageKey, next);
      } catch {
        // Storage unavailable — the choice just will not survive a reload.
      }
    },
    [controlledMode, onModeChange, storageKey],
  );

  const toggle = useCallback(() => {
    setMode(colorScheme === "dark" ? "light" : "dark");
  }, [colorScheme, setMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, colorScheme, setMode, toggle }),
    [mode, colorScheme, setMode, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

ThemeProvider.displayName = "ThemeProvider";

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("[awesome-ui] `useTheme` must be used inside a <ThemeProvider>.");
  }
  return context;
}

/**
 * Inline script that applies the stored theme before first paint, so a dark-mode
 * user never sees a white flash. Drop into `<head>` via `dangerouslySetInnerHTML`.
 */
export function getThemeScript(storageKey = "aui-theme"): string {
  return `!function(){try{var m=localStorage.getItem(${JSON.stringify(
    storageKey,
  )});if(m==="light"||m==="dark")document.documentElement.setAttribute("data-theme",m)}catch(e){}}()`;
}
