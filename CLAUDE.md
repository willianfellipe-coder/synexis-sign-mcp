# CLAUDE.md — Synexis Sign MCP Server (APOSENTADO)

## ⚠️ Leia antes de qualquer coisa

**Este repositório foi aposentado em 2026-08-03.** Não implemente features novas aqui, não
adicione tools, não atualize dependências. Se alguém pedir para "adicionar uma tool ao MCP
do Synexis Sign", o lugar certo é a plataforma:

```
Synexis Sign - Plataforma/lib/mcp/tools/
```

O servidor MCP oficial é **embutido na plataforma** (`POST /mcp`, Streamable HTTP, spec
`2025-11-25`, token próprio em Configurações → MCP). Contrato completo em
`Synexis Sign - Plataforma/docs/synexis/MCP.md`.

Exceções que justificam mexer aqui: corrigir dano silencioso (tool cujo nome promete uma
coisa e o efeito é outra) ou atualizar a documentação de aposentadoria. Nada mais.

## O que este repo era

Servidor MCP standalone (Node 22 + TypeScript + `@modelcontextprotocol/sdk` + Zod) que
wrappeava a API REST do Synexis Sign por stdio. 14 tools, ~35% de cobertura do
`docs/openapi.json` da plataforma. Nunca foi publicado no npm nem configurado em nenhum
cliente.

**Repo:** `willianfellipe-coder/synexis-sign-mcp`

## Workspace

```
Synexis Sign/
├── Synexis Sign - Plataforma/    ← API REST + MCP oficial embutido (lib/mcp/)
├── Synexis Sign - Landing page/  ← site institucional
└── Synexis Sign - MCP/           ← este repo (aposentado)
```

## Onde está a verdade sobre a API

Não confie nas tabelas deste repo — elas congelaram em 2026-07-26. As fontes autoritativas
ficam na plataforma:

| O quê | Onde |
|---|---|
| Spec OpenAPI (37 operações) | `Synexis Sign - Plataforma/docs/openapi.json` |
| Guia da API REST | `.../docs/synexis/API.md` |
| MCP embutido (oficial) | `.../docs/synexis/MCP.md` e `lib/mcp/` |
| Rotas | `.../config/routes.rb` + `config/initializers/synexis_routes.rb` |

Detalhe que morde: várias rotas da API (`/templates/pdf`, `/docx`, `/html`,
`/templates/:id/bulk`) **não estão em `config/routes.rb`** — são registradas por load hooks
em `config/initializers/synexis_routes.rb`, para manter o `routes.rb` rebaseável contra o
upstream do DocuSeal.

## Desenvolvimento (referência)

```bash
npm run dev        # tsx src/server.ts
npm run build      # tsc → dist/
npm run typecheck  # tsc --noEmit
```

**Auth:** `X-Auth-Token` (token da API REST, Configurações → API). Não confundir com o
`McpToken` do MCP embutido, que é `Authorization: Bearer` e sai de Configurações → MCP.

## Estrutura

```
src/
├── server.ts          # stdio MCP server (McpServer + StdioServerTransport)
├── client.ts          # HTTP wrapper — fetch com X-Auth-Token
├── types.ts           # tipos TS + schemas Zod
└── tools/
    ├── index.ts       # registerAllTools() → 14 tools
    ├── templates.ts   # list, get, create_from_pdf, create_from_html (quebrada)
    ├── submissions.ts # create, get, list, archive
    ├── contacts.ts    # list, create, update, delete
    ├── webhooks.ts    # list
    └── account.ts     # get_usage
```

## Dívidas conhecidas (não corrigir — está aposentado)

- `create_template_from_html` responde `422` sempre: manda `documents[].file` em base64, a
  API espera `documents[].html` ou `html` no topo.
- SDK 1.29.0 usando a API `server.tool()`, hoje substituída por `registerTool()`.
- Não envia `Idempotency-Key`; não trata `429`; `client.ts` quebra em resposta não-JSON.

## A única correção pós-aposentadoria

`cancel_submission` → **`archive_submission`**. Ela fazia `DELETE /api/submissions/:id`, que
só grava `archived_at` — o envio sumia da tela do remetente e os signatários seguiam com o
link válido, sendo cobrados. Cancelar de verdade é `Submissions::Cancel` (grava
`canceled_at`, encerra a trilha, avisa os pendentes), disponível só na web e no MCP
embutido. **A API REST não expõe cancelamento.** Se um dia precisar, abra
`POST /api/submissions/:id/cancel` na plataforma reusando `Submissions::Cancel` — não
replique a lógica aqui.
