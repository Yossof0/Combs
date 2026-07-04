import { createApp } from "./server.js";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const app = createApp();

app.listen(PORT, () => {
  console.error(`[wordcomb-mcp] Server running on port ${PORT}`);
  console.error(`[wordcomb-mcp] SSE endpoint: http://localhost:${PORT}/sse`);
  console.error(`[wordcomb-mcp] Health check: http://localhost:${PORT}/health`);
});
