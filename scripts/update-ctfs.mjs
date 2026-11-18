// Reescreve a seção entre <!-- ctfs:start --> e <!-- ctfs:end --> do README com os
// últimos writeups do feed do site (contrato no ADR 0024 do fahledu.com.br).
// Sem dependências: Node 18+ (fetch nativo).
import { readFileSync, writeFileSync } from "node:fs";

const FEED = "https://fahledu.com.br/writeups.json";
const LIMIT = 5;
const START = "<!-- ctfs:start -->";
const END = "<!-- ctfs:end -->";

const res = await fetch(FEED);
if (!res.ok) throw new Error(`feed respondeu ${res.status}`);
const { items } = await res.json();
if (!Array.isArray(items)) throw new Error("feed sem items");

// Markdown: escapa colchetes do título para não quebrar o link.
const md = (text) => String(text).replace(/([[\]\\])/g, "\\$1");
const lines = items
  .slice(0, LIMIT)
  .map((w) => `- [${md(w.title)}](${w.url}) · ${md(w.platform)} · ${md(w.category)} · ${w.date}`);
const block = lines.length > 0 ? lines.join("\n") : "- Nenhum writeup publicado ainda.";

const readme = readFileSync("README.md", "utf8");
const i = readme.indexOf(START);
const j = readme.indexOf(END);
if (i < 0 || j < i) throw new Error("marcadores ctfs não encontrados no README");
const next = `${readme.slice(0, i + START.length)}\n${block}\n${readme.slice(j)}`;
if (next !== readme) writeFileSync("README.md", next);
console.log(next === readme ? "sem mudança" : `atualizado: ${lines.length} writeup(s)`);
