import type { ReactNode } from "react";
import { Example } from "./components/Example";
import { PropsTable } from "./components/PropsTable";
import { CodeBlock } from "./components/CodeBlock";
import { examplesFor } from "./examples";

export interface DocPage {
  slug: string;
  title: string;
  group: string;
  lead: string;
  /** Prose that sits above the examples. */
  intro?: ReactNode;
  /** Key into the generated props data. */
  propsFile?: string;
  /** Examples that need vertical space rather than the inline row. */
  blockLayout?: boolean;
  /** Prose that sits between examples and the props table. */
  notes?: ReactNode;
}

export const pages: DocPage[] = [
  {
    slug: "",
    title: "Introduction",
    group: "Getting started",
    lead: "A personal React component library — accessible primitives, CSS Modules, zero runtime dependencies.",
    intro: (
      <div className="prose">
        <p>
          awesome-ui is distributed two ways from one source: as a compiled npm package,
          and as source you copy into your own tree with the shadcn CLI. The same files
          back both, so nothing diverges.
        </p>
        <h2 className="sectionTitle">Architecture</h2>
        <p>Five layers, one-way dependencies. Nothing imports upward.</p>
        <CodeBlock
          language="text"
          code={`patterns/     composed, opinionated  (DataTable, Form)
components/   styled + accessible    (Button, Select, Dialog)
primitives/   behavior, zero style   (Slot, Portal, DismissableLayer)
hooks/utils/  logic, no DOM opinion  (useControllableState, useRovingFocus)
tokens/       no React at all        (CSS custom properties)`}
        />
        <h2 className="sectionTitle">The component contract</h2>
        <p>Every component:</p>
        <ul>
          <li>forwards its ref</li>
          <li>
            spreads <code>...rest</code> onto the root, so <code>aria-*</code>,{" "}
            <code>data-*</code> and handlers pass through
          </li>
          <li>
            merges <code>className</code> rather than replacing it
          </li>
          <li>
            supports <code>asChild</code>, rendering your element with its styling and
            behaviour
          </li>
          <li>
            exposes state as data attributes (<code>data-state</code>,{" "}
            <code>data-loading</code>) so you can style it from outside
          </li>
          <li>accepts both controlled and uncontrolled props</li>
        </ul>
        <h2 className="sectionTitle">Why CSS Modules</h2>
        <p>
          Tokens are CSS custom properties, not a JS theme object. Theming is a variable
          override — no re-render, works during SSR, works outside React. Consumers import
          one stylesheet and configure nothing.
        </p>
      </div>
    ),
  },
  {
    slug: "installation",
    title: "Installation",
    group: "Getting started",
    lead: "Install the package, or copy the source.",
    intro: (
      <div className="prose">
        <h2 className="sectionTitle">As a package</h2>
        <CodeBlock language="bash" code={`npm i @abek/awesome-ui`} />
        <p>Import the stylesheet once, near the root of your app:</p>
        <CodeBlock
          code={`import { Button, ThemeProvider } from "@abek/awesome-ui";
import "@abek/awesome-ui/styles.css";

export function App() {
  return (
    <ThemeProvider>
      <Button>Save</Button>
    </ThemeProvider>
  );
}`}
        />
        <h2 className="sectionTitle">As source</h2>
        <p>
          Copy a component into your own tree and own it from then on. Files land under{" "}
          <code>@/aui/</code> with imports already rewritten.
        </p>
        <CodeBlock language="bash" code={`npx shadcn@latest add https://<your-host>/r/button.json`} />
        <h2 className="sectionTitle">Dark mode</h2>
        <p>
          <code>ThemeProvider</code> stamps <code>data-theme</code> on the document and the
          tokens do the rest. To avoid a white flash on first paint, inline the script it
          ships with:
        </p>
        <CodeBlock
          code={`import { getThemeScript } from "@abek/awesome-ui";

<script dangerouslySetInnerHTML={{ __html: getThemeScript() }} />`}
        />
      </div>
    ),
  },

  // ---------- components ----------
  {
    slug: "button",
    title: "Button",
    group: "Actions",
    lead: "Six variants, three sizes, a loading state, and asChild.",
    propsFile: "components/Button/Button.types.ts",
    notes: (
      <div className="prose">
        <p>
          <strong>Loading does not resize the button.</strong> The label stays laid out and
          is only made invisible, so a button that says &ldquo;Save changes&rdquo; does not
          shrink to a spinner and shove the layout around.
        </p>
        <p>
          <code>asChild</code> renders your element with the button&rsquo;s styling and
          behaviour — a real anchor, with real link semantics, that looks like a button.
        </p>
      </div>
    ),
  },
  {
    slug: "badge",
    title: "Badge",
    group: "Data display",
    lead: "Status pill with three variants, five tones, and an optional dot.",
    propsFile: "components/Badge/Badge.types.ts",
    notes: (
      <div className="prose">
        <p>
          Use <code>srLabel</code> when the badge&rsquo;s meaning lives in colour or an
          abbreviation — a &ldquo;3&rdquo; that means &ldquo;3 unread messages&rdquo;. The
          visible text stays short; assistive tech gets the whole thing.
        </p>
      </div>
    ),
  },
  {
    slug: "avatar",
    title: "Avatar",
    group: "Data display",
    lead: "Initials fallback, deterministic tint, status dot, and stacking.",
    propsFile: "components/Avatar/Avatar.types.ts",
    notes: (
      <div className="prose">
        <p>
          The tint is a <strong>stable hash of the name</strong>, not a random pick, so the
          same person keeps the same colour across reloads and across machines.
        </p>
        <p>
          Initials are an abbreviation, so the full name is still rendered for screen
          readers behind them — an avatar that announces only &ldquo;AL&rdquo; tells nobody
          anything.
        </p>
      </div>
    ),
  },
  {
    slug: "spinner",
    title: "Spinner",
    group: "Data display",
    lead: "Busy indicator that announces itself, or stays silent when decorative.",
    propsFile: "components/Spinner/Spinner.types.ts",
    notes: (
      <div className="prose">
        <p>
          A spinner is either announced or silent, never both. With a label it takes{" "}
          <code>role=&quot;status&quot;</code> and owns the announcement; with{" "}
          <code>label={"{null}"}</code> it is <code>aria-hidden</code>, for when a
          surrounding element already says &ldquo;loading&rdquo;.
        </p>
        <p>Under reduced motion it pulses instead of spinning — a busy signal still has to be visible.</p>
      </div>
    ),
  },
  {
    slug: "card",
    title: "Card",
    group: "Data display",
    lead: "Surface with header, media, body and footer sections.",
    propsFile: "components/Card/Card.types.ts",
    blockLayout: true,
    notes: (
      <div className="prose">
        <p>
          <code>interactive</code> styles hover and press affordances but deliberately does{" "}
          <strong>not</strong> make a div focusable. Pair it with <code>asChild</code> and a
          real button or anchor, so keyboard operability comes from the element rather than
          from a handler.
        </p>
      </div>
    ),
  },
  {
    slug: "input",
    title: "Input",
    group: "Forms",
    lead: "Text input with label, description and error wired for assistive tech.",
    propsFile: "components/Input/Input.types.ts",
    blockLayout: true,
  },
  {
    slug: "checkbox",
    title: "Checkbox",
    group: "Forms",
    lead: "Checkbox with indeterminate state, over a real input.",
    propsFile: "components/Checkbox/Checkbox.types.ts",
    blockLayout: true,
    notes: (
      <div className="prose">
        <p>
          The rendered control is a real <code>&lt;input type=&quot;checkbox&quot;&gt;</code>,
          visually hidden but still in the layout — so form participation, validation,
          autofill and native keyboard behaviour all keep working.
        </p>
        <p>
          <code>indeterminate</code> exists only as a DOM property with no attribute
          equivalent, so React cannot set it declaratively. The component assigns it in an
          effect, including clearing it when the prop goes away.
        </p>
      </div>
    ),
  },
  {
    slug: "switch",
    title: "Switch",
    group: "Forms",
    lead: "On/off control using role=switch.",
    propsFile: "components/Switch/Switch.types.ts",
    blockLayout: true,
    notes: (
      <div className="prose">
        <p>
          <code>role=&quot;switch&quot;</code> makes assistive tech say on/off rather than
          checked/unchecked, which is what a toggle actually means.
        </p>
      </div>
    ),
  },
  {
    slug: "radio-group",
    title: "RadioGroup",
    group: "Forms",
    lead: "Radio group over native inputs, so the browser owns arrow navigation.",
    propsFile: "components/RadioGroup/RadioGroup.types.ts",
    blockLayout: true,
    notes: (
      <div className="prose">
        <p>
          This is the one collection in the library that does <strong>not</strong> use{" "}
          <code>useRovingFocus</code>. Radios sharing a <code>name</code> already get
          arrow-key navigation, wrapping and roving tabindex from the browser, and they
          announce group position (&ldquo;2 of 5&rdquo;) on top of it. Reimplementing that
          would replace working platform behaviour with a worse copy.
        </p>
      </div>
    ),
  },
  {
    slug: "select",
    title: "Select",
    group: "Forms",
    lead: "Select-only combobox with roving focus, typeahead, and form participation.",
    propsFile: "components/Select/Select.types.ts",
    blockLayout: true,
    notes: (
      <div className="prose">
        <p>
          Follows the ARIA 1.2 pattern: the trigger is the <code>combobox</code>, the popup
          is the <code>listbox</code> it controls.
        </p>
        <p>
          Opening focuses the selected option, or the first one when nothing is chosen — a
          native select never opens with nothing highlighted. Typing jumps, and repeating a
          letter cycles through everything starting with it rather than searching for
          &ldquo;sss&rdquo;.
        </p>
        <p>
          A custom listbox submits nothing on its own, so <code>Select.Root</code> renders a
          hidden input when given a <code>name</code>.
        </p>
      </div>
    ),
  },
  {
    slug: "textarea",
    title: "Textarea",
    group: "Forms",
    lead: "Multi-line input with auto-resize and a character count.",
    propsFile: "components/Textarea/Textarea.types.ts",
    blockLayout: true,
    notes: (
      <div className="prose">
        <p>
          Auto-resize resets the height to <code>auto</code> before reading{" "}
          <code>scrollHeight</code>. That reset is the whole trick:{" "}
          <code>scrollHeight</code> never reports less than the element&rsquo;s current
          height, so measuring without it makes the box grow-only — delete a paragraph and
          it keeps the space.
        </p>
        <p>
          It measures in a layout effect, so the box never renders at the wrong height for
          a frame, and hands scrolling back once <code>maxRows</code> is reached.
        </p>
      </div>
    ),
  },
  {
    slug: "slider",
    title: "Slider",
    group: "Forms",
    lead: "Single and range slider with pointer, keyboard and step snapping.",
    propsFile: "components/Slider/Slider.types.ts",
    blockLayout: true,
    notes: (
      <div className="prose">
        <p>
          <strong>Steps are measured from <code>min</code>, not from zero.</strong> With a
          minimum of 5 and a step of 10, the reachable values are 5, 15, 25 — measuring
          from zero would offer 10, 20, 30 and leave the minimum unreachable.
        </p>
        <p>
          Values are rounded to the step&rsquo;s own precision, because repeated float
          arithmetic otherwise produces <code>0.30000000000000004</code> and puts it in
          the label.
        </p>
        <p>
          Range thumbs <strong>clamp against each other rather than swapping</strong>.
          Swapping changes which thumb is under the pointer mid-drag, which loses keyboard
          focus and makes the gesture jump.
        </p>
        <p>
          The <code>slider</code> role is on the thumb, not the track — the thumb is what
          takes focus and what the value belongs to. A drag uses pointer capture, so it
          keeps tracking after the pointer leaves the control.
        </p>
      </div>
    ),
  },
  {
    slug: "alert",
    title: "Alert",
    group: "Feedback",
    lead: "Inline status message with four tones.",
    propsFile: "components/Alert/Alert.types.ts",
    blockLayout: true,
    notes: (
      <div className="prose">
        <p>
          <strong>Not a live region by default.</strong> An alert rendered with the page is
          part of the page, and <code>role=&quot;alert&quot;</code> on mount interrupts
          whatever a screen reader was saying to read out something the user has not
          navigated to yet. Pass <code>live</code> for messages that appear in response to
          an action — danger tones then interrupt, everything else waits for a pause.
        </p>
      </div>
    ),
  },
  {
    slug: "progress",
    title: "Progress",
    group: "Feedback",
    lead: "Determinate and indeterminate progress.",
    propsFile: "components/Progress/Progress.types.ts",
    blockLayout: true,
    notes: (
      <div className="prose">
        <p>
          An indeterminate bar omits <code>aria-valuenow</code> entirely. Sending{" "}
          <code>0</code> instead announces &ldquo;0 percent&rdquo;, which is a claim about
          progress rather than an admission that the total is unknown.
        </p>
        <p>
          Under reduced motion the indeterminate bar pulses rather than sweeping — the
          movement is the only signal it has, so it is softened rather than removed.
        </p>
      </div>
    ),
  },
  {
    slug: "skeleton",
    title: "Skeleton",
    group: "Feedback",
    lead: "Placeholder for content that has not arrived.",
    propsFile: "components/Skeleton/Skeleton.types.ts",
    blockLayout: true,
    notes: (
      <div className="prose">
        <p>
          Always hidden from assistive tech. A screen reader announcing a row of empty
          boxes tells nobody anything; the busy state belongs on the region that is
          loading, as <code>aria-busy</code>, where it is announced once instead of once
          per placeholder.
        </p>
      </div>
    ),
  },
  {
    slug: "separator",
    title: "Separator",
    group: "Data display",
    lead: "A rule, with or without a label.",
    propsFile: "components/Separator/Separator.types.ts",
    blockLayout: true,
    notes: (
      <div className="prose">
        <p>
          <code>decorative</code> removes it from the accessibility tree. A rule that
          divides nothing should not be announced as dividing something.
        </p>
      </div>
    ),
  },
  {
    slug: "dialog",
    title: "Dialog",
    group: "Overlays",
    lead: "Modal dialog with focus trap, scroll lock and layered dismissal.",
    propsFile: "components/Dialog/Dialog.types.ts",
    notes: (
      <div className="prose">
        <p>
          <code>Dialog.Title</code> and <code>Dialog.Description</code> register themselves,
          so <code>aria-labelledby</code> and <code>aria-describedby</code> are only set
          when those nodes actually exist. A dangling reference is worse than none.
        </p>
        <p>
          Scroll stays locked for as long as the dialog is on screen, exit animation
          included — releasing early makes the page jump underneath the closing dialog.
        </p>
        <p>
          Escape peels one layer at a time, so a popover opened inside a dialog closes on
          its own first.
        </p>
      </div>
    ),
  },
  {
    slug: "popover",
    title: "Popover",
    group: "Overlays",
    lead: "Anchored popover with flip, shift, and an arrow that tracks the trigger.",
    propsFile: "components/Popover/Popover.types.ts",
    notes: (
      <div className="prose">
        <p>
          Positioning is hand-rolled rather than pulled from a library. It flips only when
          the opposite side is genuinely better, so an element taller than the viewport does
          not oscillate, and it clamps the arrow inside the content&rsquo;s corners so it
          never detaches from the body.
        </p>
      </div>
    ),
  },
  {
    slug: "tooltip",
    title: "Tooltip",
    group: "Overlays",
    lead: "Hover and focus tooltip with open/close delays.",
    propsFile: "components/Tooltip/Tooltip.types.ts",
    notes: (
      <div className="prose">
        <p>
          Opens after a delay on hover but <strong>immediately on focus</strong> — a
          keyboard user has already committed to the control, so the delay is only noise.
        </p>
        <p>
          It uses <code>aria-describedby</code>, not <code>aria-labelledby</code>: a tooltip
          supplements a control&rsquo;s name rather than replacing it.
        </p>
      </div>
    ),
  },
  {
    slug: "toast",
    title: "Toast",
    group: "Overlays",
    lead: "Notification queue with an imperative API and pausing timers.",
    propsFile: "components/Toast/Toast.types.ts",
    notes: (
      <div className="prose">
        <p>
          The queue lives in a module-level store read through{" "}
          <code>useSyncExternalStore</code>, so <code>toast()</code> works in an API client
          or an event listener, not only inside a component.
        </p>
        <p>
          Countdowns pause while the pointer is over the viewport, while anything in it has
          focus, and while the tab is in the background. A toast that expired while the user
          was elsewhere was never seen.
        </p>
        <p>
          The viewport renders even when empty, because a live region has to exist in the
          accessibility tree before content is inserted into it.
        </p>
      </div>
    ),
  },
  {
    slug: "menu",
    title: "Menu",
    group: "Navigation",
    lead: "Dropdown menu with roving focus, typeahead and toggle items.",
    propsFile: "components/Menu/Menu.types.ts",
    notes: (
      <div className="prose">
        <p>
          <code>onSelect</code> receives an event whose default can be prevented, which
          keeps the menu open. <code>Menu.CheckboxItem</code> is built on exactly that, so
          several options can be toggled in one visit.
        </p>
      </div>
    ),
  },
  {
    slug: "tabs",
    title: "Tabs",
    group: "Navigation",
    lead: "Tabs with automatic or manual activation, in either orientation.",
    propsFile: "components/Tabs/Tabs.types.ts",
    blockLayout: true,
    notes: (
      <div className="prose">
        <p>
          <strong>Automatic</strong> activation selects a tab as focus reaches it, which is
          right for cheap panels. <strong>Manual</strong> requires Enter or Space — the
          accessible choice when a panel costs a network request, since arrowing past three
          tabs should not fire three fetches.
        </p>
      </div>
    ),
  },
  {
    slug: "accordion",
    title: "Accordion",
    group: "Navigation",
    lead: "Single or multiple open panels, with animated height.",
    propsFile: "components/Accordion/Accordion.types.ts",
    blockLayout: true,
    notes: (
      <div className="prose">
        <p>
          Each trigger sits inside a real heading, because that is what lets assistive tech
          navigate an accordion as a document outline. The level is configurable, since an
          accordion&rsquo;s depth depends on the page around it.
        </p>
        <p>
          Panel height animates from a measured CSS variable — <code>height: auto</code> is
          not an animatable value.
        </p>
      </div>
    ),
  },
];

export const groups = [
  "Getting started",
  "Actions",
  "Forms",
  "Data display",
  "Feedback",
  "Overlays",
  "Navigation",
];

export function PageBody({ page }: { page: DocPage }) {
  const pageExamples = examplesFor(page.slug);

  return (
    <>
      <h1 className="pageTitle">{page.title}</h1>
      <p className="pageLead">{page.lead}</p>

      {page.intro}

      {pageExamples.length > 0 ? (
        <section className="section">
          <h2 className="sectionTitle" id="examples">
            Examples
          </h2>
          {pageExamples.map((example) => (
            <Example
              key={example.id}
              example={example}
              layout={page.blockLayout ? "block" : "inline"}
            />
          ))}
        </section>
      ) : null}

      {page.notes ? (
        <section className="section">
          <h2 className="sectionTitle" id="notes">
            Notes
          </h2>
          {page.notes}
        </section>
      ) : null}

      {page.propsFile ? (
        <section className="section">
          <h2 className="sectionTitle" id="props">
            Props
          </h2>
          <PropsTable file={page.propsFile} />
        </section>
      ) : null}
    </>
  );
}
