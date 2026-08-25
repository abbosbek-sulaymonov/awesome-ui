/**
 * Registry manifest — the copy-paste half of the hybrid model.
 *
 * The same `packages/core/src` files are shipped two ways:
 *   1. compiled, as the `@abek/awesome-ui` npm package
 *   2. as source, through this registry
 *
 * Output conforms to the shadcn registry-item schema, so consumers install with
 * the shadcn CLI and no CLI of our own:
 *
 *   npx shadcn@latest add https://<host>/r/button.json
 */

export interface RegistryItem {
  name: string;
  type: "registry:ui" | "registry:lib" | "registry:hook" | "registry:style";
  title: string;
  description: string;
  /** Paths relative to `packages/core/src`. */
  files: string[];
  /** Other registry items this one needs. Resolved recursively by the CLI. */
  registryDependencies?: string[];
  /** npm packages the consumer must install. */
  dependencies?: string[];
  cssVars?: boolean;
}

export const registry: RegistryItem[] = [
  {
    name: "utils",
    type: "registry:lib",
    title: "Utils",
    description: "Class-name joiner, ref/handler composition, and the variant resolver.",
    files: [
      "utils/cn.ts",
      "utils/composeEventHandlers.ts",
      "utils/composeRefs.ts",
      "utils/variants.ts",
    ],
  },
  {
    name: "types",
    type: "registry:lib",
    title: "Polymorphic types",
    description: "Type helpers for `as` and `asChild` components.",
    files: ["types/polymorphic.ts"],
  },
  {
    name: "tokens",
    type: "registry:style",
    title: "Design tokens",
    description: "CSS custom properties for color, space, radius, type, and motion.",
    files: ["styles/base.css"],
    cssVars: true,
  },
  {
    name: "slot",
    type: "registry:ui",
    title: "Slot",
    description: "Renders its only child with merged props — the engine behind `asChild`.",
    files: ["primitives/Slot/Slot.tsx", "primitives/Slot/index.ts"],
    registryDependencies: ["utils"],
  },
  {
    name: "portal",
    type: "registry:ui",
    title: "Portal",
    description: "SSR-safe portal that mounts after hydration.",
    files: ["primitives/Portal/Portal.tsx", "primitives/Portal/index.ts"],
    registryDependencies: ["use-isomorphic-layout-effect"],
  },
  {
    name: "visually-hidden",
    type: "registry:ui",
    title: "VisuallyHidden",
    description: "Screen-reader-only text.",
    files: [
      "primitives/VisuallyHidden/VisuallyHidden.tsx",
      "primitives/VisuallyHidden/VisuallyHidden.module.css",
      "primitives/VisuallyHidden/index.ts",
    ],
    registryDependencies: ["utils"],
  },
  {
    name: "use-controllable-state",
    type: "registry:hook",
    title: "useControllableState",
    description: "One hook covering controlled and uncontrolled props.",
    files: ["hooks/useControllableState.ts"],
  },
  {
    name: "use-disclosure",
    type: "registry:hook",
    title: "useDisclosure",
    description: "Open/close state for overlays.",
    files: ["hooks/useDisclosure.ts"],
    registryDependencies: ["use-controllable-state"],
  },
  {
    name: "use-id",
    type: "registry:hook",
    title: "useId",
    description: "SSR-safe id with a caller override, for ARIA wiring.",
    files: ["hooks/useId.ts"],
  },
  {
    name: "use-isomorphic-layout-effect",
    type: "registry:hook",
    title: "useIsomorphicLayoutEffect",
    description: "`useLayoutEffect` in the browser, `useEffect` on the server.",
    files: ["hooks/useIsomorphicLayoutEffect.ts"],
  },
  {
    name: "theme",
    type: "registry:ui",
    title: "ThemeProvider",
    description: "Light/dark/system color scheme with no-flash first paint.",
    files: ["theme/ThemeProvider.tsx", "theme/index.ts"],
    registryDependencies: ["tokens"],
  },
  {
    name: "button",
    type: "registry:ui",
    title: "Button",
    description: "Button with six variants, three sizes, loading state, and `asChild`.",
    files: [
      "components/Button/Button.tsx",
      "components/Button/Button.module.css",
      "components/Button/Button.types.ts",
      "components/Button/Button.variants.ts",
      "components/Button/index.ts",
    ],
    registryDependencies: ["utils", "types", "slot", "visually-hidden", "tokens"],
  },
  {
    name: "input",
    type: "registry:ui",
    title: "Input",
    description: "Text input with label, description, and error wired for assistive tech.",
    files: [
      "components/Input/Input.tsx",
      "components/Input/Input.module.css",
      "components/Input/Input.types.ts",
      "components/Input/Input.variants.ts",
      "components/Input/index.ts",
    ],
    registryDependencies: ["utils", "use-id", "tokens"],
  },
];
