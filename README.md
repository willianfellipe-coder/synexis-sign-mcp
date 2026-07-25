# Synexis Sign MCP Server

Servidor MCP (Model Context Protocol) para a plataforma **Synexis Sign** — permite que agentes de IA (Claude, Hermes, OpenClaw, etc.) interajam com templates, envios, contatos e webhooks via API REST.

## Instalação

```bash
cd "Synexis Sign - MCP"
npm install
npm run build
```

## Configuração

Crie um arquivo `.env` com:

```env
SYNEXIS_API_BASE_URL=https://app.synexissign.com
SYNEXIS_API_TOKEN=seu-token-de-api-aqui
```

O token é o mesmo usado para a API REST (`X-Auth-Token`), gerado em **Configurações → API** no painel.

## Uso

### Direto (dev)

```bash
npm run dev
```

### Build + produção

```bash
npm run build && npm start
```

### Com Claude Code (ou outro cliente MCP)

Adicione ao seu `claude_desktop_config.json` ou configuração equivalente:

```json
{
  "mcpServers": {
    "synexis-sign": {
      "command": "node",
      "args": ["caminho/para/Synexis Sign - MCP/dist/server.js"],
      "env": {
        "SYNEXIS_API_BASE_URL": "https://app.synexissign.com",
        "SYNEXIS_API_TOKEN": "seu-token-aqui"
      }
    }
  }
}
```

## Tools disponíveis (14)

### Templates
| Tool | Descrição |
|------|-----------|
| `list_templates` | Buscar/listar modelos por nome e pasta |
| `get_template` | Detalhes de um modelo (campos, signatários, docs) |
| `create_template_from_pdf` | Criar modelo a partir de PDF (base64) |
| `create_template_from_html` | Criar modelo a partir de HTML |

### Envios (Submissions)
| Tool | Descrição |
|------|-----------|
| `create_submission` | Enviar modelo para assinatura |
| `get_submission` | Status e detalhes de um envio |
| `list_submissions` | Listar envios com busca e filtros |
| `cancel_submission` | Cancelar envio pendente |

### Agenda (Contacts)
| Tool | Descrição |
|------|-----------|
| `list_contacts` | Listar contatos da agenda |
| `create_contact` | Criar novo contato |
| `update_contact` | Atualizar contato existente |
| `delete_contact` | Remover contato |

### Outros
| Tool | Descrição |
|------|-----------|
| `list_webhooks` | Listar webhooks configurados |
| `get_account_usage` | Consumo do plano (envelopes, armazenamento) |

## Stack

- **Runtime:** Node.js 22
- **MCP SDK:** `@modelcontextprotocol/sdk`
- **Validação:** Zod
- **HTTP:** fetch nativo
- **Build:** TypeScript → dist/

## Licença

MIT — Synexis Tech
