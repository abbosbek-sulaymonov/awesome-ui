import type { ComponentType } from "react";

/**
 * Every example is a real file under `src/examples/<component>/<order>-<name>.tsx`.
 *
 * The rendered preview and the displayed source come from the *same* file, so
 * they cannot drift — the usual failure of hand-written docs, where the snippet
 * says one thing and the demo does another. Adding a file is all it takes to
 * add an example; nothing else needs registering.
 */

const modules = import.meta.glob<{ default: ComponentType }>("./examples/**/*.tsx", {
  eager: true,
});

const sources = import.meta.glob<string>("./examples/**/*.tsx", {
  eager: true,
  query: "?raw",
  import: "default",
});

export interface Example {
  id: string;
  component: string;
  title: string;
  Component: ComponentType;
  source: string;
}

function titleFromFile(file: string): string {
  const base = file.split("/").pop()!.replace(/\.tsx$/, "");
  // Strip the numeric ordering prefix, then turn kebab-case into words.
  const withoutOrder = base.replace(/^\d+-/, "");
  const spaced = withoutOrder.replace(/-/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export const examples: Example[] = Object.keys(modules)
  .sort()
  .map((file) => {
    const parts = file.split("/");
    const component = parts[2]!;

    return {
      id: file,
      component,
      title: titleFromFile(file),
      Component: modules[file]!.default,
      // Trim the trailing newline the loader keeps, so code blocks have no
      // dangling blank line.
      source: (sources[file] ?? "").trimEnd(),
    };
  });

export function examplesFor(component: string): Example[] {
  return examples.filter((example) => example.component === component);
}
