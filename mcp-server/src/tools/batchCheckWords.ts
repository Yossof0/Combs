import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { checkWord } from "../utils/dictionary.js";

const schema = z.object({
  words: z
    .array(z.string().min(1))
    .min(1)
    .max(50)
    .describe("Words to check. Max 50 per call to avoid rate limiting."),
  language: z.enum(["en", "ar"]).describe("Language to check against."),
});

const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 150;

export function registerBatchCheckWords(server: McpServer): void {
  server.tool(
    "batch_check_words",
    "Check whether multiple words (up to 50) exist in the English or Arabic dictionary. Returns a split of realWords vs notFound, plus a full per-word results array.",
    schema.shape,
    async (input) => {
      const { words, language } = input;
      const results: Array<{ word: string; isReal: boolean }> = [];

      for (let i = 0; i < words.length; i += BATCH_SIZE) {
        const batch = words.slice(i, i + BATCH_SIZE);
        const checks = await Promise.all(batch.map((w) => checkWord(w, language)));
        batch.forEach((word, idx) => results.push({ word, isReal: checks[idx] }));

        if (i + BATCH_SIZE < words.length) {
          await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
        }
      }

      const realWords = results.filter((r) => r.isReal).map((r) => r.word);
      const notFound = results.filter((r) => !r.isReal).map((r) => r.word);

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            language,
            total: words.length,
            realCount: realWords.length,
            realWords,
            notFound,
            results,
          }),
        }],
      };
    }
  );
}
