import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { checkWord } from "../utils/dictionary.js";

const schema = z.object({
  word: z.string().min(1).describe("The word to look up in the dictionary."),
  language: z
    .enum(["en", "ar"])
    .describe("'en' uses Free Dictionary API. 'ar' uses Arabic Wiktionary (min 3 chars, Arabic script only)."),
});

export function registerCheckWord(server: McpServer): void {
  server.tool(
    "check_word",
    "Check whether a single word exists in the English or Arabic dictionary. Returns isReal boolean and a human-readable note.",
    schema.shape,
    async (input) => {
      const { word, language } = input;
      const isReal = await checkWord(word, language);
      const langLabel = language === "ar" ? "Arabic" : "English";

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            word,
            language,
            isReal,
            note: isReal
              ? `"${word}" is a valid ${langLabel} word.`
              : `"${word}" was not found in the ${langLabel} dictionary.`,
          }),
        }],
      };
    }
  );
}
