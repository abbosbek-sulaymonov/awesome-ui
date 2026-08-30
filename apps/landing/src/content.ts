/**
 * Everything the page states about the project, in one place.
 *
 * The numbers are checked against the real repo by the test suite, so a claim
 * cannot quietly drift from the thing it describes — a landing page that
 * overstates its own project is worse than one that says less.
 */

export const VERSION = "0.0.1";
export const REPO_URL = "https://github.com/abbosbek-sulaymonov/awesome-ui";
export const DOCS_URL = "../docs/";
export const INSTALL_COMMAND = "npm i @abek/awesome-ui";

export interface Stat {
  value: string;
  label: string;
}

export const stats: Stat[] = [
  { value: "33", label: "components" },
  { value: "505", label: "tests" },
  { value: "40 kB", label: "gzipped" },
  { value: "0", label: "runtime dependencies" },
];

export interface Feature {
  icon: "accessibility" | "feather" | "palette" | "box" | "moon" | "type";
  title: string;
  body: string;
}

export const features: Feature[] = [
  {
    icon: "accessibility",
    title: "Accessible on purpose",
    body: "Focus traps, roving focus, typeahead and layered dismissal are written here, not imported. Every component is tested through its keyboard and its ARIA, not its markup.",
  },
  {
    icon: "feather",
    title: "Nothing at runtime",
    body: "No styling library, no positioning library, no utility helpers. React is a peer dependency and the install adds nothing else to your tree.",
  },
  {
    icon: "palette",
    title: "CSS Modules, no setup",
    body: "One stylesheet import and you are done. No Tailwind config, no build plugin, no PostCSS pipeline to keep in step.",
  },
  {
    icon: "moon",
    title: "Theming without re-renders",
    body: "Design tokens are CSS custom properties, so a theme change is a variable override. It works during SSR and outside React entirely.",
  },
  {
    icon: "box",
    title: "Two ways to take it",
    body: "Install the package, or copy the source into your own tree with the shadcn CLI and own it from then on. The same files back both.",
  },
  {
    icon: "type",
    title: "Typed, and documented from the types",
    body: "Written in strict TypeScript. The documentation's prop tables are generated from the real declarations, so they cannot drift from the code.",
  },
];

export const principles = [
  "Every component forwards its ref and spreads the props you pass it.",
  "className merges rather than replaces, so you are never fighting the library.",
  "asChild renders your element with the component's styling and behaviour.",
  "State is exposed as data attributes, styleable from outside.",
  "Controlled and uncontrolled are the same component, not two.",
];

export const EXAMPLE_CODE = `import { Button, Combobox, ThemeProvider } from "@abek/awesome-ui";
import "@abek/awesome-ui/styles.css";

const frameworks = [
  { value: "react", label: "React" },
  { value: "svelte", label: "Svelte" },
];

export function App() {
  return (
    <ThemeProvider>
      <Combobox
        options={frameworks}
        label="Framework"
        placeholder="Search frameworks"
      />

      {/* asChild renders a real anchor with the button's styling */}
      <Button asChild variant="outline">
        <a href="/docs">Read the docs</a>
      </Button>
    </ThemeProvider>
  );
}`;
