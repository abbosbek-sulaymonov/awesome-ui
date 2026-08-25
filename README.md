# awesome-ui

A personal React component library. Accessible primitives, CSS Modules, zero runtime dependencies.

Distributed two ways from one source:

- **as a package** — `npm i @abek/awesome-ui`, import and go
- **as source** — copy components into your own tree with the shadcn CLI, then own them

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
      <Button variant="solid">Save</Button>
    </ThemeProvider>
  );
}
```

## Copy the source instead

```bash
npx shadcn@latest add https://<your-host>/r/button.json
```

Files land under `@/aui/`, imports already rewritten. Same code that ships in the package.

## Architecture

Five layers, one-way dependencies. Nothing imports upward.

```
patterns/     composed, opinionated  (DataTable, Form)
components/   styled + accessible    (Button, Input)
primitives/   behavior, zero style   (Slot, Portal, VisuallyHidden)
hooks/utils/  logic, no DOM opinion  (useControllableState, cn, createVariants)
tokens/       no React at all        (CSS custom properties)
```

Tokens are CSS custom properties, not a JS theme object. Theming is a variable
override — no re-render, works server-side, works outside React.

### Component contract

Every component:

1. forwards its ref
2. spreads `...rest` onto the root, so `aria-*`, `data-*` and handlers pass through
3. merges `className` rather than replacing it
4. supports `asChild`, rendering your element with its styling and behavior
5. exposes state as data attributes (`data-state`, `data-loading`) so you can
   style it from outside without knowing the internals
6. accepts both controlled and uncontrolled props via one `useControllableState`

## Repo layout

```
packages/
  tokens/    design tokens -> tokens.css + typed TS mirror
  core/      the library (@abek/awesome-ui)
  config/    shared tsconfig
apps/
  playground/  Vite sandbox for fast iteration
registry/
  manifest.ts       what the copy-paste registry ships
  __generated__/    shadcn-compatible JSON (build output)
scripts/
  build-registry.ts
```

## Commands

```bash
pnpm install
pnpm dev          # watch builds across the workspace
pnpm build        # build every package
pnpm test         # vitest
pnpm typecheck
pnpm registry     # regenerate registry/__generated__
pnpm changeset    # record a version bump
```

Run the sandbox:

```bash
pnpm --filter @awesome-ui/playground dev
```

## Status

Foundation and first components are in place: `Button`, `Input`, `ThemeProvider`,
`Slot`, `Portal`, `VisuallyHidden`, plus the hook and utility layer.

Next: Card, Badge, Spinner, Checkbox, Switch — then the overlay set (Dialog,
Popover, Tooltip, Toast), which needs a focus trap, a dismissable-layer stack,
and positioning built first.

## License

MIT © Abbosbek Sulaymonov
