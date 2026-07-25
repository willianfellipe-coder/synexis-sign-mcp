import { z } from "zod";
import type { SynexisClient } from "../client.js";

export function registerTemplateTools(client: SynexisClient) {
  return [
    {
      name: "list_templates" as const,
      description:
        "Lista modelos de documento (templates) da conta. Suporta busca por nome e filtro por pasta.",
      schema: {
        q: z.string().optional().describe("Termo de busca por nome do modelo"),
        folder: z.string().optional().describe("Nome da pasta"),
        limit: z.number().int().min(1).max(100).optional().default(10).describe("Limite de resultados"),
      },
      handler: async (params: { q?: string; folder?: string; limit?: number }) => {
        const qs = new URLSearchParams();
        if (params.q) qs.set("q", params.q);
        if (params.folder) qs.set("folder", params.folder);
        if (params.limit) qs.set("limit", String(params.limit));

        const result = await client.get(`/api/templates?${qs.toString()}`);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      },
    },
    {
      name: "get_template" as const,
      description:
        "Obtém os detalhes de um modelo, incluindo campos, signatários configurados e documentos.",
      schema: {
        template_id: z.number().int().describe("ID do modelo"),
      },
      handler: async (params: { template_id: number }) => {
        const result = await client.get(`/api/templates/${params.template_id}`);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      },
    },
    {
      name: "create_template_from_pdf" as const,
      description:
        "Cria um novo modelo de documento a partir de um arquivo PDF (enviado como base64). O PDF pode conter campos de formulário que serão detectados automaticamente.",
      schema: {
        name: z.string().min(1).describe("Nome do modelo"),
        file_base64: z.string().describe("Arquivo PDF em base64"),
        external_id: z.string().optional().describe("ID externo para upsert"),
        folder_name: z.string().optional().describe("Pasta de destino"),
      },
      handler: async (params: { name: string; file_base64: string; external_id?: string; folder_name?: string }) => {
        const body: Record<string, unknown> = {
          documents: [{ name: params.name, file: params.file_base64 }],
          name: params.name,
        };
        if (params.external_id) body.external_id = params.external_id;
        if (params.folder_name) body.folder_name = params.folder_name;

        const result = await client.post("/api/templates/pdf", body);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      },
    },
    {
      name: "create_template_from_html" as const,
      description:
        "Cria um novo modelo de documento a partir de conteúdo HTML. O HTML é convertido para PDF automaticamente.",
      schema: {
        name: z.string().min(1).describe("Nome do modelo"),
        html: z.string().min(1).describe("Conteúdo HTML do documento"),
        external_id: z.string().optional().describe("ID externo para upsert"),
        folder_name: z.string().optional().describe("Pasta de destino"),
      },
      handler: async (params: { name: string; html: string; external_id?: string; folder_name?: string }) => {
        const body: Record<string, unknown> = {
          documents: [{ name: params.name, file: Buffer.from(params.html).toString("base64") }],
          name: params.name,
        };
        if (params.external_id) body.external_id = params.external_id;
        if (params.folder_name) body.folder_name = params.folder_name;

        const result = await client.post("/api/templates/html", body);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      },
    },
  ];
}
