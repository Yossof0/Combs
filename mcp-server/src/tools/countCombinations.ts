import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { countPermutations, isFeasible } from "../utils/permutations.js";

const schema = z.object({
  letters: z
    .array(z.string().min(1).max(2))
    .min(1)
    .max(12)
    .describe("Characters to count combinations for."),
  r: z
    .number()
    .int()
    .min(1)
    .describe("Number of characters per combination."),
});

export function registerCountCombinations(server: McpServer): void {
  server.tool(
    "count_combinations",
    "Instantly count how many permutations would be generated for a character set and length, without generating them. Also reports whether the count is feasible (<500k).",
    schema.shape,
    async (input) => {
      const { letters, r } = input;

      if (r > letters.length) {
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({ error: `r (${r}) cannot exceed the number of letters (${letters.length}).` }),
          }],
        };
      }

      const count = countPermutations(letters.length, r);
      const feasible = isFeasible(letters.length, r);

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            input: { letters, r },
            count,
            feasible,
            note: feasible
              ? "Safe to generate with generate_combinations."
              : "Too large (>500,000). Reduce letters or r before generating.",
          }),
        }],
      };
    }
  );
}
