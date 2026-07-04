import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerGenerateCombinations } from "./generateCombinations.js";
import { registerCountCombinations } from "./countCombinations.js";
import { registerCheckWord } from "./checkWord.js";
import { registerBatchCheckWords } from "./batchCheckWords.js";

export function registerTools(server: McpServer): void {
  registerGenerateCombinations(server);
  registerCountCombinations(server);
  registerCheckWord(server);
  registerBatchCheckWords(server);
}
