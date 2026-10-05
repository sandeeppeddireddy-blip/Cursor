import { defineTool } from "@cursor/bdk/tools";
import { z } from "zod";
import { getDocument } from "../lib/knowledge.js";

export default defineTool({
  description:
    "Load the full text of one internal knowledge article by id (for example product-catalog or discount-policy).",
  effect: "read",
  inputSchema: z.object({
    id: z
      .string()
      .min(1)
      .describe("Document id without .md, matching a search_knowledge hit"),
  }),
  async execute({ id }) {
    const document = await getDocument(id);
    if (!document) {
      return { found: false as const, id };
    }
    return {
      found: true as const,
      id: document.id,
      title: document.title,
      path: document.path,
      body: document.body,
    };
  },
});
