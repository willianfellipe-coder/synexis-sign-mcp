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

  // stderr, não stdout: o transporte stdio usa stdout para o JSON-RPC — escrever ali
  // corromperia o protocolo. O cliente MCP mostra stderr nos logs do servidor.
  console.error("[synexis-mcp] ══════════════════════════════════════════════════════════");
  console.error("[synexis-mcp] ⚠️  SERVIDOR APOSENTADO — sem manutenção desde 2026-08-03.");
  console.error("[synexis-mcp] O caminho oficial é o MCP embutido na plataforma:");
  console.error("[synexis-mcp]   POST https://app.synexissign.com/mcp");
  console.error("[synexis-mcp]   Token em Configurações → MCP (não é o token da API REST).");
  console.error("[synexis-mcp] Migração: veja o README deste repositório.");
  console.error("[synexis-mcp] ══════════════════════════════════════════════════════════");
  console.error(`[synexis-mcp] conectado — ${tools.length} tools registradas`);
  console.error(`[synexis-mcp] API: ${baseUrl}`);
}

main().catch((err) => {
  console.error("[synexis-mcp] erro fatal:", err.message);
  process.exit(1);
});
