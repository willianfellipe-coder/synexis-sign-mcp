# Synexis Sign MCP Server — ⚠️ APOSENTADO

> **Este repositório foi aposentado em 2026-08-03 e não recebe mais manutenção.**
>
> O caminho oficial para agentes de IA operarem o Synexis Sign é o **MCP embutido na
> própria plataforma**, documentado em
> [`docs/synexis/MCP.md`](../Synexis%20Sign%20-%20Plataforma/docs/synexis/MCP.md).
>
> O código continua aqui como referência histórica. Não instale em clientes novos.

## Por que aposentamos

Este servidor era um wrapper Node standalone sobre a API REST. A plataforma passou a
embarcar o próprio servidor MCP (`POST /mcp`), que é melhor em tudo que importa para um
agente:

| | Este repo (aposentado) | MCP embutido (oficial) |
|---|---|---|
| Transporte | stdio — só roda na máquina do usuário | Streamable HTTP — qualquer cliente, qualquer lugar |
| Spec MCP | `@modelcontextprotocol/sdk` 1.29 (API `server.tool()` legada) | `2025-11-25` (aceita `2025-03-26`) |
| Auth | token da API REST (`X-Auth-Token`) | `McpToken` dedicado, revogável, com trilha de uso |
| Envio de PDF | base64 inteiro num argumento — LLM trunca e o PDF chega corrompido | upload em chunks + `POST /mcp/upload` binário |
| Permissões | o que o token da API permitir | `accessible_by`/`authorize!` do CanCan, por tool |
| Observabilidade | nenhuma | erros no Sentry com `extra.mcp_tool` |
| Cancelamento | **arquivava sem avisar ninguém** (ver abaixo) | cancela de verdade e avisa os signatários |
| Cobertura da API | 14 tools, ~35% do `openapi.json`, 1 quebrada | 7 tools cobrindo o fluxo que importa |

## Migração

Nada a desinstalar: este servidor **nunca chegou a ser configurado em nenhum cliente**
(não está no `claude_desktop_config.json`, em nenhum `.mcp.json` nem publicado no npm).
Se você tiver uma cópia rodando em algum lugar, remova a entrada do `mcpServers` e
configure o embutido:

```json
{
  "mcpServers": {
    "synexis-sign": {
      "type": "http",
      "url": "https://app.synexissign.com/mcp",
      "headers": { "Authorization": "Bearer SEU_MCP_TOKEN" }
    }
  }
}
```

O token sai de **Configurações → MCP** no painel (`/settings/mcp`) e aparece **uma única
vez** — guardamos só o SHA-256. **Não é o mesmo token da API REST**, que fica em
Configurações → API.

### De-para das tools

| Aqui (aposentado) | No MCP embutido |
|---|---|
| `create_submission` | `upload_document` → `send_document` (fluxo document-first, sem template) |
| `get_submission` | `get_submission` |
| `list_submissions` | `search_documents` |
| `archive_submission` | `cancel_submission` — cancela de verdade e notifica os pendentes |
| `list_contacts` | `list_contacts` |
| `create_contact` | `create_contact` |
| `update_contact`, `delete_contact` | sem equivalente — use a API REST ou o painel |
| `list_templates`, `get_template`, `create_template_from_pdf`, `create_template_from_html` | **sem equivalente, de propósito.** O MCP embutido é document-first: um agente que chama `create_template` recebe `-32601`. Template é complexidade que o agente não precisa carregar — mande o PDF direto. |
| `list_webhooks`, `get_account_usage` | sem equivalente — use a API REST (`GET /api/webhooks`, `GET /api/account/usage`) |

O que não tem tool continua acessível pela **API REST**, que segue viva e mantida:
[`docs/synexis/API.md`](../Synexis%20Sign%20-%20Plataforma/docs/synexis/API.md) e o spec
completo em `docs/openapi.json` (37 operações).

## Estado do código no momento da aposentadoria

Dívidas conhecidas, deixadas sem correção de propósito — não investimos em código
aposentado:

- **`create_template_from_html` está quebrado.** Envia `documents:[{name, file}]` com o
  HTML em base64; a API espera `documents:[{name, html}]` ou `html` no topo. Sempre
  responde `422 documents is required`. Falha alta e visível, sem risco de dado errado.
- **Cobertura de ~35% da API.** Ficaram de fora, entre outros: `POST /submissions/init`
  (devolve as URLs de assinatura), `GET /submissions/:id/documents`, `GET/PUT /submitters/:id`,
  CRUD de webhooks, `POST /tools/verify`, `POST /templates/:id/bulk`, `POST /templates/:id/clone`.
- **SDK MCP desatualizado** (1.29.0; a versão atual é 1.30.0) e usando a API `server.tool()`,
  substituída por `registerTool()`.
- **Não envia `Idempotency-Key`**, que a API suporta nas rotas de criação.
- **Não trata `429`** (rate limit por conta: 600 req/min no Profissional, 1200 no Empresarial).
- **`client.ts` assume resposta JSON** — um 502 do proxy vira erro opaco no `res.json()`.

### A correção que fizemos antes de arquivar

`cancel_submission` foi renomeada para **`archive_submission`**. Ela chamava
`DELETE /api/submissions/:id`, que apenas grava `archived_at`: o envio sumia da tela do
remetente enquanto os signatários seguiam com o link válido, recebendo cobrança e
achando que precisavam assinar. O nome prometia uma coisa e o efeito era outra — dano
silencioso, o único tipo que justifica mexer em código que está sendo aposentado.

Cancelar de verdade (`canceled_at` + trilha + e-mail aos pendentes) roda em
`Submissions::Cancel`, que a **API REST não expõe** — só a web (`POST /submissions/:id/cancel`,
autenticado por sessão) e o MCP embutido. Se um dia a API precisar cancelar, o caminho é
abrir esse endpoint na plataforma reusando o mesmo serviço, não replicar a lógica aqui.

## Rodar mesmo assim (referência)

```bash
npm install && npm run build
SYNEXIS_API_TOKEN="seu-token" npm start
```

Variáveis: `SYNEXIS_API_TOKEN` (obrigatória, token de Configurações → API) e
`SYNEXIS_API_BASE_URL` (opcional, default `https://app.synexissign.com`).

## Licença

MIT — Synexis Tech
