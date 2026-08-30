import { describe, expect, it } from "vitest";
import { tokenize } from "../src/index";

const typesOf = (code: string, lang?: Parameters<typeof tokenize>[1]) =>
  tokenize(code, lang).map((token) => token.type);

const find = (code: string, value: string, lang?: Parameters<typeof tokenize>[1]) =>
  tokenize(code, lang).find((token) => token.value === value);

describe("tokenize", () => {
  it("reassembles the original source exactly", () => {
    const code = `import { Button } from "@abek/awesome-ui";\n\n// a comment\nconst x = <Button size="sm" />;\n`;
    expect(tokenize(code).map((token) => token.value).join("")).toBe(code);
  });

  it("does not turn a URL inside a string into a comment", () => {
    // The failure this guards: matching comments before strings makes the //
    // in a URL swallow the rest of the line.
    const tokens = tokenize(`const url = "https://example.com";`);
    const string = tokens.find((token) => token.type === "string");

    expect(string?.value).toBe(`"https://example.com"`);
    expect(tokens.some((token) => token.type === "comment")).toBe(false);
  });

  it("keeps quotes inside a comment as part of the comment", () => {
    const tokens = tokenize(`// it's fine`);
    expect(tokens).toHaveLength(1);
    expect(tokens[0]).toEqual({ type: "comment", value: `// it's fine` });
  });

  it("marks keywords, types and calls", () => {
    const code = `const value = useState(Boolean);`;
    expect(find(code, "const")?.type).toBe("keyword");
    expect(find(code, "useState")?.type).toBe("function");
    expect(find(code, "Boolean")?.type).toBe("type");
  });

  it("marks JSX tags and attributes", () => {
    const code = `<Button size="sm" onClick={run} />`;
    expect(find(code, "<Button")?.type).toBe("tag");
    expect(find(code, "size")?.type).toBe("property");
    expect(find(code, "/>")?.type).toBe("tag");
  });

  it("handles template literals and block comments", () => {
    expect(find("`a ${b} c`", "`a ${b} c`")?.type).toBe("string");
    expect(find("/* multi\nline */", "/* multi\nline */")?.type).toBe("comment");
  });

  it("is not stateful between calls", () => {
    // The pattern is module-level and global, so its cursor must be reset or a
    // second call resumes wherever the first stopped.
    const code = `const a = 1;`;
    expect(typesOf(code)).toEqual(typesOf(code));
  });

  it("highlights bash", () => {
    const tokens = tokenize("npm i @abek/awesome-ui --save-dev # install", "bash");
    expect(tokens.find((token) => token.type === "keyword")?.value.trim()).toBe("npm");
    expect(tokens.find((token) => token.type === "property")?.value).toBe("--save-dev");
    expect(tokens.find((token) => token.type === "comment")?.value).toBe("# install");
  });

  it("distinguishes json keys from string values", () => {
    const tokens = tokenize(`{"name": "awesome-ui", "private": true}`, "json");
    expect(tokens.find((token) => token.type === "property")?.value).toBe(`"name"`);
    expect(tokens.find((token) => token.type === "string")?.value).toBe(`"awesome-ui"`);
    expect(tokens.find((token) => token.type === "keyword")?.value).toBe("true");
  });

  it("leaves plain text alone", () => {
    expect(tokenize("just words", "text")).toEqual([{ type: "plain", value: "just words" }]);
  });

  it("returns nothing for empty input", () => {
    expect(tokenize("", "tsx")).toEqual([]);
    expect(tokenize("", "text")).toEqual([]);
  });

  it("never loses characters on a realistic module", () => {
    // The docs suite runs this same round-trip over every real example; this
    // keeps a representative case here, where the highlighter now lives.
    const source = [
      'import { Button, toast } from "@abek/awesome-ui";',
      "",
      "// A comment with a URL: https://example.com/path?a=1",
      "export default function Demo({ label = `hi ${name}` }: Props) {",
      "  const [open, setOpen] = useState<boolean>(false);",
      '  return <Button variant="solid" onClick={() => toast.success(label)}>{label}</Button>;',
      "}",
    ].join("\n");

    expect(tokenize(source).map((token) => token.value).join("")).toBe(source);
  });
});
