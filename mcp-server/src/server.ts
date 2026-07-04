import express, { type Request, type Response } from "express";
import cors from "cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

import { registerTools } from "./tools/index.js";

// Active SSE transports keyed by sessionId
const transports = new Map<string, SSEServerTransport>();

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "wordcomb",
    version: "1.0.0",
  });
  registerTools(server);
  return server;
}

export function createApp(): express.Application {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // ── Health check (Railway uses this) ────────────────────────────────────────
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", server: "wordcomb-mcp", version: "1.0.0" });
  });

  // ── SSE connection endpoint ──────────────────────────────────────────────────
  app.get("/sse", async (_req: Request, res: Response) => {
    const transport = new SSEServerTransport("/messages", res);
    const server = createMcpServer();

    transports.set(transport.sessionId, transport);

    res.on("close", () => {
      transports.delete(transport.sessionId);
    });

    await server.connect(transport);
  });

  // ── Message POST endpoint (AI sends tool calls here) ────────────────────────
  app.post("/messages", async (req: Request, res: Response) => {
    const sessionId = req.query.sessionId as string;

    if (!sessionId) {
      res.status(400).json({ error: "Missing sessionId query parameter." });
      return;
    }

    const transport = transports.get(sessionId);

    if (!transport) {
      res.status(404).json({ error: `No active session found for sessionId: ${sessionId}` });
      return;
    }

    await transport.handlePostMessage(req, res);
  });

  return app;
}
