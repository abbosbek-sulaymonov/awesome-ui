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
  tokens/     design tokens -> tokens.css + typed TS mirror
  core/       the library (@abek/awesome-ui)
  highlight/  small syntax highlighter shared by docs and landing
  config/     shared tsconfig
apps/
  landing/     marketing site, built out of the library itself
  docs/        documentation site
  playground/  Vite sandbox for fast iteration
registry/
  manifest.ts       what the copy-paste registry ships
  __generated__/    shadcn-compatible JSON (build output)
scripts/
  build-registry.ts
  build-props.ts    extracts prop tables from the TS source
```

## Commands

```bash
pnpm install
pnpm dev          # watch builds across the workspace
pnpm build        # build every package
pnpm test         # vitest
pnpm typecheck
pnpm props        # regenerate the docs prop tables from the TS source
pnpm registry     # regenerate registry/__generated__
pnpm changeset    # record a version bump
```

Run the landing page, the docs site, or the bare sandbox:

```bash
pnpm --filter @awesome-ui/landing dev
pnpm --filter @awesome-ui/docs dev
pnpm --filter @awesome-ui/playground dev
```

## Landing page

`apps/landing` is built out of the library it advertises — every control on it is
imported from the published entry point rather than mocked up. That makes the
showcase a standing check that the package works outside its own test suite, and
it means the page cannot show something the library does not actually do.

Its numeric claims are tested against the repo: the component count is read from
the source tree, the "zero runtime dependencies" line fails if a dependency is
ever added, and the version is compared with the package's own. A landing page
that overstates its project is worse than one that says less.

## Documentation

`apps/docs` is a Vite site with a page per component. Two things in it are worth
knowing about:

**Examples are real files.** Each one lives at
`src/examples/<component>/<order>-<name>.tsx` and is picked up by a glob, so
adding a file adds an example with nothing to register. The rendered preview and
the displayed source come from the *same* file, which is why the snippet can
never disagree with the demo — the usual way component docs go stale.

**Prop tables are generated from the types.** `pnpm props` walks the real
`*.types.ts` declarations with the TypeScript compiler API and writes
`apps/docs/src/generated/props.json`, pulling names, types, `@default` tags and
JSDoc descriptions. Props inherited from `ComponentPropsWithoutRef` are excluded,
since a few hundred native DOM props say nothing about a component. Rename a prop
and the docs change on the next build rather than quietly going stale.

The site's own test suite renders every page and every example, so a broken
example fails the build instead of greeting a reader.

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

## Form controls

`Checkbox` and `Switch` render a real `<input>` — visually hidden, but still in
the layout and still doing everything a native control does: form participation,
validation, autofill, and the keyboard behaviour you get for free. The visible
box or track is a sibling that reacts to `:focus-visible` and `data-state`.

`Switch` uses `role="switch"`, so assistive tech says on/off rather than
checked/unchecked. `Checkbox` supports `indeterminate`, which exists only as a
DOM property — there is no attribute for it, so React cannot set it
declaratively and the component does it in an effect.

All three form controls (`Input` included) share `useField`, which generates the
ids and assembles `aria-describedby`. Its one job is to never reference an id
for an element that was not rendered: a dangling `aria-describedby` is worse
than none, because screen readers announce nothing and can drop the rest of the
list with it.

## Select

A select-only combobox following the ARIA 1.2 pattern: the trigger is the
`combobox`, the popup is the `listbox` it controls.

```tsx
<Select.Root defaultValue="react" name="framework">
  <Select.Trigger label="Framework">
    <Select.Value placeholder="Pick one" />
  </Select.Trigger>
  <Select.Content>
    <Select.Group>
      <Select.Label>Virtual DOM</Select.Label>
      <Select.Item value="react">React</Select.Item>
      <Select.Item value="vue">Vue</Select.Item>
    </Select.Group>
  </Select.Content>
</Select.Root>
```

It rests on two new hooks, both reusable by `Menu`, `Tabs` and `RadioGroup`:

| Hook | Job |
| --- | --- |
| `useRovingFocus` | Arrow keys, Home/End, wrapping, disabled-item skipping |
| `useTypeahead` | Type-to-jump, with repeat-key cycling |

`useRovingFocus` moves **real DOM focus** rather than tracking
`aria-activedescendant`. Real focus is what makes `:focus-visible`,
scroll-into-view and screen-reader cursors behave without reimplementing each —
the cost is that items carry `tabindex="-1"`.

`useTypeahead` copies two behaviours native `<select>` has and hand-rolled
versions usually miss: repeating a character cycles through everything starting
with it rather than searching for `"sss"`, and the search begins *after* the
current item so a repeated key advances instead of re-selecting.

A custom listbox submits nothing on its own, so `Select.Root` renders a hidden
input when given a `name`.

## Collections

`Menu` and `Tabs` are assembled from `useRovingFocus` and `useTypeahead`.
`RadioGroup` deliberately is **not**: radios sharing a `name` already get
arrow-key navigation, wrapping and roving tabindex from the browser, and they
announce group position ("2 of 5") on top of it. Reimplementing that would
replace working platform behaviour with a worse copy. The roving hook exists for
collections the platform does not cover.

`Tabs` supports both activation modes. `automatic` selects a tab as focus
reaches it, which is right for cheap panels. `manual` requires Enter or Space —
the accessible choice when a panel costs a network request, since arrowing past
three tabs should not fire three fetches.

`Menu.Item` receives an `onSelect` whose default can be prevented to keep the
menu open. `Menu.CheckboxItem` uses that, so several options can be toggled in
one visit.

## Status

33 components:

| Group | Components |
| --- | --- |
| Actions | `Button`, `Toggle`, `ToggleGroup` |
| Forms | `Input`, `Textarea`, `NumberInput`, `Checkbox`, `Switch`, `RadioGroup`, `Select`, `Combobox`, `Slider` |
| Navigation | `Menu`, `Tabs`, `Accordion`, `Collapsible`, `Breadcrumb`, `Pagination` |
| Data display | `Table`, `Card`, `Badge`, `Avatar`, `Spinner`, `Separator` |
| Feedback | `Alert`, `Progress`, `Skeleton`, `Toast` |
| Overlays | `Dialog`, `AlertDialog`, `Drawer`, `Popover`, `Tooltip` |

Plus `ThemeProvider`, the primitive and hook layers, and the positioning engine.

518 tests, 53 registry items, 40 kB gzipped.

518 tests in total: 394 in the library, 99 in the docs site, 13 on the landing
page and 12 on the highlighter.

The package is ready to publish and the docs site is ready to deploy; neither
has happened yet.

## License

MIT © Abbosbek Sulaymonov
