/**
 * Reads `registry/manifest.ts`, inlines each listed source file, rewrites the
 * package's relative imports to the consumer's alias, and writes one JSON per
 * item plus an index — the artifacts the shadcn CLI fetches.
 *
 *   pnpm registry
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { registry } from "../registry/manifest.js";
import type { RegistryItem } from "../registry/manifest.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = join(root, "packages/core/src");
const outDir = join(root, "registry/__generated__");

/** Where copied files land in the consumer's project. */
const ALIAS = "@/aui";

interface RegistryFile {
  path: string;
  content: string;
  type: RegistryItem["type"];
  target: string;
}

/**
 * Turn `../../utils/cn` into `@/components/aui/utils/cn`.
 *
 * Inside the monorepo every cross-layer import is relative; once the file is
 * copied into someone else's tree those relative paths still resolve, because
 * we preserve the directory layout under the alias. Rewriting to the alias is
 * what makes the copied files readable and movable.
 */
function rewriteImports(content: string, filePath: string): string {
  const fileDir = dirname(filePath);

  return content.replace(
    /(from\s+|import\s+)(["'])(\.\.?\/[^"']+)\2/g,
    (match, prefix: string, quote: string, specifier: string) => {
      // A same-directory import stays relative — those files travel together.
      if (specifier.startsWith("./")) return match;

      const absolute = resolve(fileDir, specifier);
      const fromRoot = relative(sourceRoot, absolute);

      // Escaped the package? Leave it alone rather than emit a broken alias.
      if (fromRoot.startsWith("..")) return match;

      return `${prefix}${quote}${ALIAS}/${fromRoot.split("\\").join("/")}${quote}`;
    },
  );
}

function buildItem(item: RegistryItem) {
  const files: RegistryFile[] = item.files.map((relativePath) => {
    const absolute = join(sourceRoot, relativePath);
    const raw = readFileSync(absolute, "utf8");

    return {
      path: relativePath,
      content: rewriteImports(raw, absolute),
      type: item.type,
      target: `${ALIAS.replace("@/", "")}/${relativePath}`,
    };
  });

  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
    ...(item.dependencies?.length ? { dependencies: item.dependencies } : {}),
    ...(item.registryDependencies?.length
      ? { registryDependencies: item.registryDependencies }
      : {}),
    files,
  };
}

function main() {
  mkdirSync(outDir, { recursive: true });

  const names = new Set(registry.map((item) => item.name));
  for (const item of registry) {
    for (const dependency of item.registryDependencies ?? []) {
      if (!names.has(dependency)) {
        throw new Error(
          `[registry] "${item.name}" depends on "${dependency}", which is not in the manifest.`,
        );
      }
    }
  }

  for (const item of registry) {
    const built = buildItem(item);
    writeFileSync(join(outDir, `${item.name}.json`), `${JSON.stringify(built, null, 2)}\n`);
  }

  const index = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "awesome-ui",
    homepage: "https://github.com/abek01sulaymonov/awesome-ui",
    items: registry.map(({ name, type, title, description }) => ({
      name,
      type,
      title,
      description,
    })),
  };
  writeFileSync(join(outDir, "index.json"), `${JSON.stringify(index, null, 2)}\n`);

  console.log(`[registry] wrote ${registry.length} items to ${relative(root, outDir)}`);
}

main();
