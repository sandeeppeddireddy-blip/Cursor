import { defineTool } from "@cursor/bdk/tools";
import { z } from "zod";
import { searchKnowledge } from "../lib/knowledge.js";

export default defineTool({
  description:
    "Search the internal knowledge corpus. Use this before answering product, policy, pricing, support, or competitive questions.",
  effect: "read",
  inputSchema: z.object({
    query: z.string().min(1).describe("Natural-language search query"),
    limit: z.number().int().min(1).max(10).optional(),
  }),
  async execute({ query, limit }) {
    const hits = await searchKnowledge(query, limit ?? 5);
    return { query, hitCount: hits.length, hits };
  },
});
