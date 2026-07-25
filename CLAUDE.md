# CLAUDE.md — Synexis Sign MCP Server

## O que é

Servidor MCP (Model Context Protocol) standalone que wrappeia a API REST do Synexis Sign. Permite que agentes (Claude, Hermes, OpenClaw) interajam com templates, envios, contatos e webhooks.

**Repo:** `willianfellipe-coder/synexis-sign-mcp` · **Stack:** Node 22 + TypeScript + `@modelcontextprotocol/sdk` + Zod

## Workspace

```
Synexis Sign/
├── Synexis Sign - Plataforma/    ← API REST que este MCP wrappeia
├── Synexis Sign - Landing page/  ← site institucional
└── Synexis Sign - MCP/           ← este repo
```

## Desenvolvimento

```bash
npm run dev        # tsx src/server.ts
npm run build      # tsc → dist/
npm run typecheck  # tsc --noEmit
```

**Auth:** `X-Auth-Token` header (token de API do tenant). Configurado via env vars.

## Estrutura

```
src/
├── server.ts          # stdio MCP server (McpServer + StdioServerTransport)
├── client.ts          # HTTP wrapper — fetch com X-Auth-Token
├── types.ts           # tipos TS + schemas Zod
└── tools/
    ├── index.ts       # registerAllTools() → 14 tools
    ├── templates.ts   # list, get, create_from_pdf, create_from_html
    ├── submissions.ts # create, get, list, cancel
    ├── contacts.ts    # list, create, update, delete
    ├── webhooks.ts    # list
    └── account.ts     # get_usage
```

## Testar

```bash
# Teste do protocolo MCP sem token real:
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | SYNEXIS_API_TOKEN=test npm run dev

# Teste contra produção (requer token válido):
SYNEXIS_API_TOKEN="seu-token" npm run dev
# Ctrl+C, depois cole um JSON-RPC de tools/call
```

## Adicionar uma nova tool

1. Criar arquivo em `src/tools/novo.ts` com `export function registerNovoTools(client)`
2. Cada tool = `{ name, description, schema: { ... } (Zod), handler: async (params) => ({ content: [...] }) }`
3. Importar e adicionar ao spread em `src/tools/index.ts`
4. `npm run typecheck && npm run build`
5. Testar com `echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | SYNEXIS_API_TOKEN=test npm run dev`

## Endpoints da API (referência)

| Recurso | Base |
|----------|------|
| Templates | `GET/POST /api/templates`, `POST /api/templates/pdf`, `/api/templates/html` |
| Submissions | `GET/POST/DELETE /api/submissions`, `/api/submissions/:id` |
| Contacts | `GET/POST/PATCH/DELETE /api/contacts` |
| Webhooks | `GET /api/webhooks` |
| Account | `GET /api/account/usage` |

Respostas são JSON. Coleções usam `{ data: [...], pagination: { count, next, prev } }`. Erros: `{ error: "mensagem" }`.

## Deploy

- **Não há deploy automático.** O MCP roda localmente em cada cliente (stdio).
- `npm run build` gera `dist/` pronto para `node dist/server.js`
- Para distribuir como binário global: `npm install -g .` (usa o campo `bin` do package.json)
