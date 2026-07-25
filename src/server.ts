#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SynexisClient } from "./client.js";
import { registerAllTools } from "./tools/index.js";

async function main() {
  const client = new SynexisClient();

  const server = new McpServer({
    name: "synexis-sign",
    version: "1.0.0",
  });

  const tools = registerAllTools(client);

  for (const tool of tools) {
    server.tool(tool.name, tool.description, tool.schema, tool.handler);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);

  const baseUrl = process.env.SYNEXIS_API_BASE_URL ?? "https://app.synexissign.com";
  console.error(`[synexis-mcp] conectado — ${tools.length} tools registradas`);
  console.error(`[synexis-mcp] API: ${baseUrl}`);
}

main().catch((err) => {
  console.error("[synexis-mcp] erro fatal:", err.message);
  process.exit(1);
});
