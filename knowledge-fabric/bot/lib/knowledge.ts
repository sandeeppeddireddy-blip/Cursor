import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type KnowledgeDocument = {
  id: string;
  title: string;
  path: string;
  body: string;
};

export type KnowledgeHit = {
  id: string;
  title: string;
  path: string;
  snippet: string;
  score: number;
};

const knowledgeDir = path.resolve(
  fileURLToPath(new URL("../../knowledge", import.meta.url)),
);

let cache: KnowledgeDocument[] | undefined;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter((token) => token.length > 1);
}

function snippetAround(body: string, terms: string[]): string {
  const lower = body.toLowerCase();
  let index = -1;
  for (const term of terms) {
    index = lower.indexOf(term);
    if (index >= 0) break;
  }
  if (index < 0) {
    return body.slice(0, 280).trim();
  }
  const start = Math.max(0, index - 80);
  const end = Math.min(body.length, index + 200);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < body.length ? "…" : "";
  return `${prefix}${body.slice(start, end).trim()}${suffix}`;
}

export async function loadDocuments(): Promise<KnowledgeDocument[]> {
  if (cache) return cache;
  const entries = await readdir(knowledgeDir, { withFileTypes: true });
  const docs: KnowledgeDocument[] = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const filePath = path.join(knowledgeDir, entry.name);
    const raw = await readFile(filePath, "utf8");
    const titleMatch = raw.match(/^#\s+(.+)$/m);
    const id = entry.name.replace(/\.md$/, "");
    docs.push({
      id,
      title: titleMatch?.[1]?.trim() ?? id,
      path: `knowledge/${entry.name}`,
      body: raw,
    });
  }
  cache = docs.sort((a, b) => a.id.localeCompare(b.id));
  return cache;
}

export async function searchKnowledge(
  query: string,
  limit = 5,
): Promise<KnowledgeHit[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const terms = tokenize(trimmed);
  if (terms.length === 0) return [];
  const docs = await loadDocuments();
  const scored: KnowledgeHit[] = [];
  for (const doc of docs) {
    const haystack = `${doc.title}\n${doc.body}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      const matches = haystack.split(term).length - 1;
      if (matches === 0) continue;
      const titleBoost = doc.title.toLowerCase().includes(term) ? 4 : 0;
      score += matches + titleBoost;
    }
    if (score <= 0) continue;
    scored.push({
      id: doc.id,
      title: doc.title,
      path: doc.path,
      snippet: snippetAround(doc.body, terms),
      score,
    });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

export async function getDocument(
  id: string,
): Promise<KnowledgeDocument | undefined> {
  const docs = await loadDocuments();
  return docs.find((doc) => doc.id === id);
}
