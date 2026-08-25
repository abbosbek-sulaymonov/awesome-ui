/**
 * Typed mirror of the CSS custom properties declared in `tokens.css`.
 *
 * These are `var()` references, not literal values — read them in TS/JS
 * (inline styles, canvas, chart libraries) and the active theme still wins,
 * because resolution stays in CSS.
 */

export const color = {
  bg: "var(--aui-color-bg)",
  bgSubtle: "var(--aui-color-bg-subtle)",
  bgMuted: "var(--aui-color-bg-muted)",
  surface: "var(--aui-color-surface)",
  surfaceRaised: "var(--aui-color-surface-raised)",

  fg: "var(--aui-color-fg)",
  fgMuted: "var(--aui-color-fg-muted)",
  fgSubtle: "var(--aui-color-fg-subtle)",
  fgOnAccent: "var(--aui-color-fg-on-accent)",

  border: "var(--aui-color-border)",
  borderStrong: "var(--aui-color-border-strong)",

  accent: "var(--aui-color-accent)",
  accentHover: "var(--aui-color-accent-hover)",
  accentActive: "var(--aui-color-accent-active)",
  accentSubtle: "var(--aui-color-accent-subtle)",

  danger: "var(--aui-color-danger)",
  dangerHover: "var(--aui-color-danger-hover)",
  dangerSubtle: "var(--aui-color-danger-subtle)",
  success: "var(--aui-color-success)",
  warning: "var(--aui-color-warning)",

  focusRing: "var(--aui-color-focus-ring)",
  overlay: "var(--aui-color-overlay)",
} as const;

export const space = {
  0: "var(--aui-space-0)",
  1: "var(--aui-space-1)",
  2: "var(--aui-space-2)",
  3: "var(--aui-space-3)",
  4: "var(--aui-space-4)",
  5: "var(--aui-space-5)",
  6: "var(--aui-space-6)",
  8: "var(--aui-space-8)",
  10: "var(--aui-space-10)",
  12: "var(--aui-space-12)",
  16: "var(--aui-space-16)",
} as const;

export const radius = {
  none: "var(--aui-radius-none)",
  sm: "var(--aui-radius-sm)",
  md: "var(--aui-radius-md)",
  lg: "var(--aui-radius-lg)",
  xl: "var(--aui-radius-xl)",
  full: "var(--aui-radius-full)",
} as const;

export const font = {
  sans: "var(--aui-font-sans)",
  mono: "var(--aui-font-mono)",
} as const;

export const fontSize = {
  xs: "var(--aui-text-xs)",
  sm: "var(--aui-text-sm)",
  md: "var(--aui-text-md)",
  lg: "var(--aui-text-lg)",
  xl: "var(--aui-text-xl)",
  "2xl": "var(--aui-text-2xl)",
} as const;

export const fontWeight = {
  normal: "var(--aui-weight-normal)",
  medium: "var(--aui-weight-medium)",
  semibold: "var(--aui-weight-semibold)",
  bold: "var(--aui-weight-bold)",
} as const;

export const shadow = {
  sm: "var(--aui-shadow-sm)",
  md: "var(--aui-shadow-md)",
  lg: "var(--aui-shadow-lg)",
} as const;

export const duration = {
  fast: "var(--aui-duration-fast)",
  normal: "var(--aui-duration-normal)",
  slow: "var(--aui-duration-slow)",
} as const;

export const easing = {
  standard: "var(--aui-ease-standard)",
  emphasized: "var(--aui-ease-emphasized)",
} as const;

export const zIndex = {
  dropdown: "var(--aui-z-dropdown)",
  sticky: "var(--aui-z-sticky)",
  overlay: "var(--aui-z-overlay)",
  modal: "var(--aui-z-modal)",
  popover: "var(--aui-z-popover)",
  toast: "var(--aui-z-toast)",
  tooltip: "var(--aui-z-tooltip)",
} as const;

export const tokens = {
  color,
  space,
  radius,
  font,
  fontSize,
  fontWeight,
  shadow,
  duration,
  easing,
  zIndex,
} as const;

export type Tokens = typeof tokens;
export type ColorToken = keyof typeof color;
export type SpaceToken = keyof typeof space;
export type RadiusToken = keyof typeof radius;
