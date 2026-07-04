import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { generatePermutations, isFeasible, countPermutations } from "../utils/permutations.js";

const schema = z.object({
  letters: z
    .array(z.string().min(1).max(2))
    .min(1)
    .max(12)
    .describe("Characters (letters or digits) to combine. Max 12."),
  r: z
    .number()
    .int()
    .min(1)
    .describe("Number of characters per combination. Must be ≤ letters.length."),
  unique: z
    .boolean()
    .optional()
    .default(true)
    .describe("Return only unique combinations. Defaults to true."),
});

export function registerGenerateCombinations(server: McpServer): void {
  server.tool(
    "generate_combinations",
    "Generate every possible permutation of a character set at a given length. Supports letters (A-Z, Arabic) and digits (0-9). Returns the full combinations array as JSON.",
    schema.shape,
    async (input) => {
      const { letters, r, unique } = input;

      if (r > letters.length) {
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({ error: `r (${r}) cannot exceed the number of letters (${letters.length}).` }),
          }],
        };
      }

      if (!isFeasible(letters.length, r)) {
        const count = countPermutations(letters.length, r);
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              error: `Too many combinations (${count.toLocaleString()}). Reduce letters or r to stay under 500,000.`,
            }),
          }],
        };
      }

      const combinations = generatePermutations(letters, r);

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({ input: { letters, r, unique }, count: combinations.length, combinations }),
        }],
      };
    }
  );
}
