/**
 * A small syntax highlighter for the languages the docs actually contain.
 *
 * Hand-rolled rather than pulling in Shiki or Prism, for two reasons. Shiki
 * ships a fixed theme as a JSON colour map, so its output cannot follow the
 * design tokens into dark mode without shipping two themes and swapping them;
 * these tokens emit class names that resolve through CSS variables instead, so
 * light and dark come free. And a highlighter for four languages is smaller
 * than the loader either library needs.
 *
 * It is a tokenizer, not a parser. It gets `const`, strings, comments, JSX tags
 * and calls right, which is all the examples contain. It does not attempt regex
 * literals or type-level syntax, and it never needs to: a wrong colour is a
 * cosmetic bug, not a broken page.
 */

export type TokenType =
  | "comment"
  | "string"
  | "keyword"
  | "number"
  | "tag"
  | "property"
  | "function"
  | "type"
  | "punctuation"
  | "plain";

export interface Token {
  type: TokenType;
  value: string;
}

export type Language = "tsx" | "ts" | "bash" | "json" | "text";

const KEYWORDS = [
  "import", "from", "export", "default", "const", "let", "var", "function",
  "return", "if", "else", "for", "while", "new", "class", "extends", "typeof",
  "interface", "type", "as", "await", "async", "try", "catch", "finally",
  "throw", "switch", "case", "break", "continue", "null", "undefined", "true",
  "false", "this", "void", "in", "of", "do", "instanceof", "delete", "yield",
  "static", "readonly", "public", "private", "protected", "enum", "namespace",
  "declare", "satisfies", "keyof", "implements",
].join("|");

/**
 * Strings come before comments deliberately. The other order turns the `//` in
 * a URL inside a string literal into a comment that swallows the rest of the
 * line — `"https://example.com"` is the case that catches it.
 */
const TSX_PATTERN = new RegExp(
  [
    String.raw`(?<string>\`(?:\\.|[^\`\\])*\`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')`,
    String.raw`(?<comment>\/\/[^\n]*|\/\*[\s\S]*?\*\/)`,
    String.raw`(?<tag><\/?[A-Za-z][\w.]*|\/>|>)`,
    String.raw`(?<number>\b\d+(?:\.\d+)?\b)`,
    String.raw`(?<keyword>\b(?:${KEYWORDS})\b)`,
    String.raw`(?<property>\b[a-zA-Z_$][\w$-]*(?=\s*=(?!=)))`,
    String.raw`(?<function>\b[a-zA-Z_$][\w$]*(?=\s*\())`,
    String.raw`(?<type>\b[A-Z][\w$]*\b)`,
    String.raw`(?<punctuation>=>|\.\.\.|[{}()[\].,;:]|[+\-*/%=<>!&|?]+)`,
  ].join("|"),
  "g",
);

const BASH_PATTERN = new RegExp(
  [
    String.raw`(?<comment>#[^\n]*)`,
    String.raw`(?<string>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')`,
    String.raw`(?<property>(?<=\s)--?[\w-]+)`,
    String.raw`(?<keyword>^\s*(?:npm|npx|pnpm|yarn|bun|git|cd|node)\b)`,
    String.raw`(?<punctuation>[|&;>])`,
  ].join("|"),
  "gm",
);

const JSON_PATTERN = new RegExp(
  [
    String.raw`(?<property>"(?:\\.|[^"\\])*"(?=\s*:))`,
    String.raw`(?<string>"(?:\\.|[^"\\])*")`,
    String.raw`(?<number>-?\b\d+(?:\.\d+)?\b)`,
    String.raw`(?<keyword>\b(?:true|false|null)\b)`,
    String.raw`(?<punctuation>[{}[\],:])`,
  ].join("|"),
  "g",
);

function patternFor(language: Language): RegExp | null {
  switch (language) {
    case "tsx":
    case "ts":
      return TSX_PATTERN;
    case "bash":
      return BASH_PATTERN;
    case "json":
      return JSON_PATTERN;
    default:
      return null;
  }
}

export function tokenize(code: string, language: Language = "tsx"): Token[] {
  const pattern = patternFor(language);
  if (!pattern) return code ? [{ type: "plain", value: code }] : [];

  const tokens: Token[] = [];
  let lastIndex = 0;

  // The regex is module-level and global, so its cursor has to be reset or a
  // second call would resume from wherever the previous one stopped.
  pattern.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(code)) !== null) {
    // Zero-width matches would spin forever.
    if (match[0] === "") {
      pattern.lastIndex += 1;
      continue;
    }

    if (match.index > lastIndex) {
      tokens.push({ type: "plain", value: code.slice(lastIndex, match.index) });
    }

    const groups = match.groups ?? {};
    const type = (Object.keys(groups).find((key) => groups[key] !== undefined) ??
      "plain") as TokenType;

    tokens.push({ type, value: match[0] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < code.length) {
    tokens.push({ type: "plain", value: code.slice(lastIndex) });
  }

  return tokens;
}
