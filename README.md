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

## Overlays

`Dialog`, `Popover` and `Tooltip` are compound components — you assemble the
parts, so nothing is locked behind a props API:

```tsx
<Dialog.Root>
  <Dialog.Trigger asChild>
    <Button variant="danger">Delete</Button>
  </Dialog.Trigger>
  <Dialog.Overlay />
  <Dialog.Content size="sm">
    <Dialog.Header>
      <Dialog.Title>Delete project</Dialog.Title>
      <Dialog.Description>This cannot be undone.</Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Dialog.Close asChild><Button variant="ghost">Cancel</Button></Dialog.Close>
      <Button variant="danger">Delete</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
```

They sit on four hand-built primitives, each usable on its own:

| Primitive | Job |
| --- | --- |
| `useFocusTrap` | Cycles Tab inside a container and restores focus on close |
| `DismissableLayer` | Escape and outside-press dismissal, stacked so only the top layer reacts |
| `usePresence` | Defers unmount until the exit animation finishes |
| `useFloating` | Anchored positioning with flip, shift, and an arrow that tracks the anchor |

`Dialog.Title` and `Dialog.Description` register themselves, so `aria-labelledby`
and `aria-describedby` are only set when those nodes actually exist. Tooltips use
`aria-describedby` rather than `aria-labelledby`, because a tooltip supplements a
control's name instead of replacing it.

## Toast

Mount `<Toaster />` once near the root, then call `toast()` from anywhere:

```tsx
import { Toaster, toast } from "@abek/awesome-ui";

toast.success("Project saved");
toast.error("Could not save", { description: err.message });
toast("Project deleted", { action: { label: "Undo", onClick: restore } });
toast.promise(save(), { loading: "Saving…", success: "Saved", error: "Failed" });
```

The queue lives in a module-level store read through `useSyncExternalStore`, so
`toast()` works in an API client or an event listener, not only inside a
component. Countdowns pause while the pointer is over the viewport, while
anything in it has focus, and while the tab is in the background — a toast that
expired while the user was elsewhere was never seen.

The viewport renders even when empty, because a live region has to exist in the
accessibility tree before content is inserted into it. Errors switch it to
`assertive`; everything else waits for a pause in speech.

## Status

In place: `Button`, `Input`, `Dialog`, `Popover`, `Tooltip`, `Toast`,
`ThemeProvider`, the primitive and hook layers, and the positioning engine.
81 tests.

Next: the simple set — `Card`, `Badge`, `Spinner`, `Checkbox`, `Switch`, `Select`.

## License

MIT © Abbosbek Sulaymonov
