/**
 * Extracts component prop tables from the TypeScript source.
 *
 * Docs that restate a component's props by hand drift the moment someone adds
 * one. This walks the real `*.types.ts` declarations with the compiler API, so
 * the table cannot disagree with the types — if a prop is renamed, the docs
 * change on the next build or the build fails.
 *
 *   pnpm props
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = join(root, "packages/core/src");
const outFile = join(root, "apps/docs/src/generated/props.json");

export interface PropDoc {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string | undefined;
  description?: string | undefined;
  deprecated?: string | undefined;
}

export interface InterfaceDoc {
  name: string;
  description?: string | undefined;
  props: PropDoc[];
}

/** Long unions wrap badly in a table cell; collapse the obvious noise. */
function formatType(type: string): string {
  return type
    .replace(/\s+/g, " ")
    // `| undefined` is implied by the optional marker we already render.
    .replace(/\s*\|\s*undefined\b/g, "")
    .trim();
}

function getJsDoc(symbol: ts.Symbol, checker: ts.TypeChecker) {
  const description = ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim();

  let defaultValue: string | undefined;
  let deprecated: string | undefined;

  for (const tag of symbol.getJsDocTags(checker)) {
    const text = ts.displayPartsToString(tag.text).trim();
    if (tag.name === "default" || tag.name === "defaultValue") defaultValue = text;
    if (tag.name === "deprecated") deprecated = text || "Deprecated";
  }

  return { description: description || undefined, defaultValue, deprecated };
}

function isPublicPropsInterface(node: ts.Node): node is ts.InterfaceDeclaration {
  if (!ts.isInterfaceDeclaration(node)) return false;
  if (!node.name.text.endsWith("Props")) return false;
  // Only exported declarations are part of the public surface.
  return Boolean(
    node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword),
  );
}

/**
 * Props inherited from `ComponentPropsWithoutRef<"div">` and friends number in
 * the hundreds and say nothing about the component. Only declarations written
 * in this repo are documented; the rest is noted as "plus native props".
 */
function isOwnDeclaration(symbol: ts.Symbol): boolean {
  const declaration = symbol.declarations?.[0];
  if (!declaration) return false;
  return !declaration.getSourceFile().fileName.includes("node_modules");
}

function main() {
  const configPath = join(root, "packages/core/tsconfig.json");
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    join(root, "packages/core"),
  );

  const program = ts.createProgram(parsed.fileNames, parsed.options);
  const checker = program.getTypeChecker();

  const byFile: Record<string, InterfaceDoc[]> = {};

  for (const sourceFile of program.getSourceFiles()) {
    if (sourceFile.isDeclarationFile) continue;
    if (!sourceFile.fileName.startsWith(sourceRoot)) continue;
    if (!sourceFile.fileName.endsWith(".types.ts")) continue;

    const key = relative(sourceRoot, sourceFile.fileName);
    const interfaces: InterfaceDoc[] = [];

    ts.forEachChild(sourceFile, (node) => {
      if (!isPublicPropsInterface(node)) return;

      const symbol = checker.getSymbolAtLocation(node.name);
      if (!symbol) return;

      const type = checker.getDeclaredTypeOfSymbol(symbol);
      const props: PropDoc[] = [];

      for (const property of checker.getPropertiesOfType(type)) {
        if (!isOwnDeclaration(property)) continue;

        const declaration = property.declarations?.[0];
        const propType = declaration
          ? checker.getTypeOfSymbolAtLocation(property, declaration)
          : checker.getTypeOfSymbol(property);

        const { description, defaultValue, deprecated } = getJsDoc(property, checker);

        props.push({
          name: property.getName(),
          type: formatType(checker.typeToString(propType)),
          required: (property.flags & ts.SymbolFlags.Optional) === 0,
          defaultValue,
          description,
          deprecated,
        });
      }

      if (props.length === 0) return;

      props.sort((a, b) => {
        // Required props first — they are what a reader needs to see.
        if (a.required !== b.required) return a.required ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

      interfaces.push({
        name: node.name.text,
        description: ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim() || undefined,
        props,
      });
    });

    if (interfaces.length > 0) byFile[key] = interfaces;
  }

  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, `${JSON.stringify(byFile, null, 2)}\n`);

  const interfaceCount = Object.values(byFile).reduce((sum, list) => sum + list.length, 0);
  const propCount = Object.values(byFile)
    .flat()
    .reduce((sum, entry) => sum + entry.props.length, 0);

  console.log(
    `[props] ${interfaceCount} interfaces, ${propCount} props from ${Object.keys(byFile).length} files -> ${relative(root, outFile)}`,
  );
}

main();
