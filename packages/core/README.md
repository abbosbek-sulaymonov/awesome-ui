# @abek/awesome-ui

A React component library. Accessible primitives, CSS Modules, zero runtime dependencies.

35 components, ~42 kB gzipped. Ships two ways from one source: as this package, or as
source you copy into your own tree.

## Install

```bash
npm i @abek/awesome-ui
```

```tsx
import { Button, Input, ThemeProvider } from "@abek/awesome-ui";
import "@abek/awesome-ui/styles.css";

export function App() {
  return (
    <ThemeProvider>
      <Input label="Email" type="email" description="We never share it." />
      <Button>Save</Button>
    </ThemeProvider>
  );
}
```

Requires React 18 or 19. Both are peer dependencies, so nothing is bundled.

## What's in it

| Group | Components |
| --- | --- |
| Actions | `Button`, `Toggle`, `ToggleGroup` |
| Forms | `Input`, `Textarea`, `NumberInput`, `Checkbox`, `Switch`, `RadioGroup`, `Select`, `Combobox`, `Slider`, `Calendar`, `DatePicker` |
| Navigation | `Menu`, `Tabs`, `Accordion`, `Collapsible`, `Breadcrumb`, `Pagination` |
| Data display | `Table`, `Card`, `Badge`, `Avatar`, `Spinner`, `Separator` |
| Feedback | `Alert`, `Progress`, `Skeleton`, `Toast` |
| Overlays | `Dialog`, `AlertDialog`, `Drawer`, `Popover`, `Tooltip` |

Plus the primitives they are built on — `Slot`, `Portal`, `DismissableLayer`,
`usePresence` — and the hooks: `useFloating`, `useFocusTrap`, `useRovingFocus`,
`useTypeahead`, `useControllableState`, `useDisclosure`, `useField`, `useScrollLock`.

## The component contract

Every component:

1. forwards its ref
2. spreads `...rest` onto its root, so `aria-*`, `data-*` and handlers pass through
3. merges `className` rather than replacing it
4. supports `asChild`, rendering your element with its styling and behaviour
5. exposes state as data attributes (`data-state`, `data-loading`) for styling from outside
6. accepts both controlled and uncontrolled props

```tsx
// asChild gives you a real anchor with real link semantics that looks like a button —
// right-click, middle-click and "open in new tab" all work, which they would not on a
// div with an onClick.
<Button asChild variant="outline">
  <a href="/docs">Docs</a>
</Button>
```

## Theming

Tokens are CSS custom properties, not a JS theme object. Theming is a variable
override: no re-render, works during SSR, works outside React.

```css
:root {
  --aui-color-accent: oklch(55% 0.2 150);
  --aui-radius-md: 0.75rem;
}
```

`ThemeProvider` stamps `data-theme` on the document and the tokens do the rest. To avoid
a flash of the wrong theme on first paint, inline the script it ships with:

```tsx
import { getThemeScript } from "@abek/awesome-ui";

<script dangerouslySetInnerHTML={{ __html: getThemeScript() }} />
```

Import `@abek/awesome-ui/tokens.css` on its own if you want the token layer without the
component styles.

## Styling a component

Component styles live in `@layer aui.components`, so your own unlayered CSS wins without
a specificity fight.

One consequence worth knowing: a global `:focus-visible` rule in your app will override
the `outline: none` that `Input` sets on its inner element, and you will get two focus
rings — the component draws its own on the wrapper so that the field's icons sit inside
it. Scope such rules away from `[class*="aui-"]` if you hit that.

## License

MIT © Abbosbek Sulaymonov
