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
  {
    name: "use-focus-trap",
    type: "registry:hook",
    title: "useFocusTrap",
    description: "Keeps Tab cycling inside a container while active.",
    files: ["hooks/useFocusTrap.ts", "utils/tabbable.ts"],
  },
  {
    name: "use-scroll-lock",
    type: "registry:hook",
    title: "useScrollLock",
    description: "Reference-counted background scroll lock.",
    files: ["hooks/useScrollLock.ts"],
    registryDependencies: ["use-isomorphic-layout-effect"],
  },
  {
    name: "use-floating",
    type: "registry:hook",
    title: "useFloating",
    description: "Anchored positioning with flip, shift, and arrow tracking.",
    files: ["hooks/useFloating.ts", "utils/position.ts"],
  },
  {
    name: "dismissable-layer",
    type: "registry:ui",
    title: "DismissableLayer",
    description: "Escape and outside-press dismissal, stacked so only the top layer reacts.",
    files: [
      "primitives/DismissableLayer/DismissableLayer.tsx",
      "primitives/DismissableLayer/layerStack.ts",
      "primitives/DismissableLayer/index.ts",
    ],
    registryDependencies: ["utils"],
  },
  {
    name: "presence",
    type: "registry:ui",
    title: "usePresence",
    description: "Defers unmount until the exit animation finishes.",
    files: ["primitives/Presence/Presence.tsx", "primitives/Presence/index.ts"],
    registryDependencies: ["use-isomorphic-layout-effect"],
  },
  {
    name: "dialog",
    type: "registry:ui",
    title: "Dialog",
    description: "Modal dialog with focus trap, scroll lock, and layered dismissal.",
    files: [
      "components/Dialog/Dialog.tsx",
      "components/Dialog/Dialog.module.css",
      "components/Dialog/Dialog.types.ts",
      "components/Dialog/DialogContext.ts",
      "components/Dialog/index.ts",
    ],
    registryDependencies: [
      "utils",
      "types",
      "slot",
      "portal",
      "presence",
      "dismissable-layer",
      "use-disclosure",
      "use-focus-trap",
      "use-scroll-lock",
      "use-id",
      "tokens",
    ],
  },
  {
    name: "popover",
    type: "registry:ui",
    title: "Popover",
    description: "Anchored popover with flip, shift, and an arrow that tracks the trigger.",
    files: [
      "components/Popover/Popover.tsx",
      "components/Popover/Popover.module.css",
      "components/Popover/Popover.types.ts",
      "components/Popover/PopoverContext.ts",
      "components/Popover/index.ts",
    ],
    registryDependencies: [
      "utils",
      "types",
      "slot",
      "portal",
      "presence",
      "dismissable-layer",
      "use-disclosure",
      "use-floating",
      "use-focus-trap",
      "use-id",
      "tokens",
    ],
  },
  {
    name: "tooltip",
    type: "registry:ui",
    title: "Tooltip",
    description: "Hover and focus tooltip with open/close delays and Escape dismissal.",
    files: [
      "components/Tooltip/Tooltip.tsx",
      "components/Tooltip/Tooltip.module.css",
      "components/Tooltip/Tooltip.types.ts",
      "components/Tooltip/index.ts",
    ],
    registryDependencies: [
      "utils",
      "types",
      "slot",
      "portal",
      "presence",
      "use-controllable-state",
      "use-floating",
      "use-id",
      "tokens",
    ],
  },
  {
    name: "toast",
    type: "registry:ui",
    title: "Toast",
    description:
      "Notification queue with an imperative API, pausing timers, and swipe-to-dismiss.",
    files: [
      "components/Toast/Toaster.tsx",
      "components/Toast/Toast.module.css",
      "components/Toast/Toast.types.ts",
      "components/Toast/ToastIcon.tsx",
      "components/Toast/toast.ts",
      "components/Toast/toastStore.ts",
      "components/Toast/useToast.ts",
      "components/Toast/index.ts",
    ],
    registryDependencies: ["utils", "portal", "presence", "tokens"],
  },
  {
    name: "use-field",
    type: "registry:hook",
    title: "useField",
    description: "Shared label, description and error wiring for form controls.",
    files: ["hooks/useField.ts"],
    registryDependencies: ["use-id"],
  },
  {
    name: "spinner",
    type: "registry:ui",
    title: "Spinner",
    description: "Busy indicator that announces itself, or stays silent when decorative.",
    files: [
      "components/Spinner/Spinner.tsx",
      "components/Spinner/Spinner.module.css",
      "components/Spinner/Spinner.types.ts",
      "components/Spinner/index.ts",
    ],
    registryDependencies: ["utils", "visually-hidden", "tokens"],
  },
  {
    name: "badge",
    type: "registry:ui",
    title: "Badge",
    description: "Status pill with three variants, five tones, and an optional dot.",
    files: [
      "components/Badge/Badge.tsx",
      "components/Badge/Badge.module.css",
      "components/Badge/Badge.types.ts",
      "components/Badge/Badge.variants.ts",
      "components/Badge/index.ts",
    ],
    registryDependencies: ["utils", "types", "slot", "visually-hidden", "tokens"],
  },
  {
    name: "card",
    type: "registry:ui",
    title: "Card",
    description: "Surface with header, media, body and footer sections.",
    files: [
      "components/Card/Card.tsx",
      "components/Card/Card.module.css",
      "components/Card/Card.types.ts",
      "components/Card/index.ts",
    ],
    registryDependencies: ["utils", "types", "slot", "tokens"],
  },
  {
    name: "checkbox",
    type: "registry:ui",
    title: "Checkbox",
    description: "Checkbox with indeterminate state over a real input.",
    files: [
      "components/Checkbox/Checkbox.tsx",
      "components/Checkbox/Checkbox.module.css",
      "components/Checkbox/Checkbox.types.ts",
      "components/Checkbox/index.ts",
    ],
    registryDependencies: ["utils", "use-controllable-state", "use-field", "tokens"],
  },
  {
    name: "switch",
    type: "registry:ui",
    title: "Switch",
    description: "On/off control using role=switch over a real input.",
    files: [
      "components/Switch/Switch.tsx",
      "components/Switch/Switch.module.css",
      "components/Switch/Switch.types.ts",
      "components/Switch/index.ts",
    ],
    registryDependencies: ["utils", "use-controllable-state", "use-field", "tokens"],
  },
  {
    name: "use-roving-focus",
    type: "registry:hook",
    title: "useRovingFocus",
    description: "Arrow-key navigation over a collection, moving real DOM focus.",
    files: ["hooks/useRovingFocus.ts"],
  },
  {
    name: "use-typeahead",
    type: "registry:hook",
    title: "useTypeahead",
    description: "Type-to-jump over a collection, with repeat-key cycling.",
    files: ["hooks/useTypeahead.ts"],
  },
  {
    name: "select",
    type: "registry:ui",
    title: "Select",
    description:
      "Select-only combobox with roving focus, typeahead, and form participation.",
    files: [
      "components/Select/Select.tsx",
      "components/Select/Select.module.css",
      "components/Select/Select.types.ts",
      "components/Select/SelectContext.ts",
      "components/Select/index.ts",
    ],
    registryDependencies: [
      "utils",
      "portal",
      "presence",
      "dismissable-layer",
      "use-controllable-state",
      "use-disclosure",
      "use-field",
      "use-floating",
      "use-id",
      "use-roving-focus",
      "use-typeahead",
      "tokens",
    ],
  },
];
