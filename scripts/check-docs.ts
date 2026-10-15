import { JSDOM } from "jsdom";
import { dirname, resolve } from "node:path";

const { window } = new JSDOM("");
Object.assign(globalThis, { window, document: window.document });
const { default: mermaid } = await import("mermaid");
mermaid.initialize({ startOnLoad: false, securityLevel: "strict" });
let diagrams = 0;
for (const pattern of ["*.md", "docs/**/*.md"]) {
  for await (const file of new Bun.Glob(pattern).scan(".")) {
    const source = await Bun.file(file).text();
    for (const match of source.matchAll(/^```mermaid\s*\n([\s\S]*?)^```/gm)) {
      try {
        await mermaid.parse(match[1]);
        diagrams++;
      } catch (error) {
        throw new Error(`Invalid Mermaid in ${file}`, { cause: error });
      }
    }
    for (const [, target] of source.matchAll(/!?\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
      if (/^(?:[a-z]+:|#)/i.test(target)) continue;
      const path = resolve(dirname(file), decodeURIComponent(target.split("#")[0]));
      if (!(await Bun.file(path).exists())) {
        throw new Error(`Broken local link in ${file}: ${target}`);
      }
    }
  }
}
if (!diagrams) throw new Error("Expected at least one Mermaid diagram");
console.log(`Validated Markdown links and ${diagrams} Mermaid diagrams`);
