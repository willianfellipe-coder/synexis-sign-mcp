import { z } from "zod";
import type { SynexisClient } from "../client.js";

const SubmitterSchema = z.object({
  name: z.string().min(1).describe("Nome completo"),
  email: z.string().email().describe("E-mail"),
  cpf: z.string().optional().describe("CPF (apenas números)"),
  phone: z.string().optional().describe("Telefone"),
  role: z.string().optional().describe("Papel no documento"),
  metadata: z.record(z.string()).optional().describe("Metadados adicionais"),
  values: z.record(z.string()).optional().describe("Valores preenchidos"),
});

export function registerSubmissionTools(client: SynexisClient) {
  return [
    {
      name: "create_submission" as const,
      description:
        "Envia um modelo para assinatura. Cria um novo envio com os signatários informados.",
      schema: {
        template_id: z.number().int().describe("ID do modelo a enviar"),
        submitters: z.array(SubmitterSchema).min(1).max(50).describe("Lista de signatários (1-50)"),
        name: z.string().optional().describe("Nome do envio (usa nome do modelo se omitido)"),
        send_email: z.boolean().optional().default(true).describe("Enviar e-mail para signatários?"),
        message_subject: z.string().optional().describe("Assunto do e-mail"),
        message_body: z.string().optional().describe("Corpo do e-mail"),
      },
      handler: async (params: {
        template_id: number;
        submitters: Array<{
          name: string; email: string; cpf?: string; phone?: string;
          role?: string; metadata?: Record<string, string>; values?: Record<string, string>;
        }>;
        name?: string;
        send_email?: boolean;
        message_subject?: string;
        message_body?: string;
      }) => {
        const body: Record<string, unknown> = {
          template_id: params.template_id,
          submitters: params.submitters,
          send_email: params.send_email ?? true,
        };
        if (params.name) body.name = params.name;
        if (params.message_subject || params.message_body) {
          body.message = {
            ...(params.message_subject && { subject: params.message_subject }),
            ...(params.message_body && { body: params.message_body }),
          };
        }

        const result = await client.post("/api/submissions", body);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      },
    },
    {
      name: "get_submission" as const,
      description:
        "Obtém o status e detalhes de um envio, incluindo signatários, documentos e trilha de auditoria.",
      schema: {
        submission_id: z.number().int().describe("ID do envio"),
      },
      handler: async (params: { submission_id: number }) => {
        const result = await client.get(`/api/submissions/${params.submission_id}`);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      },
    },
    {
      name: "list_submissions" as const,
      description: "Lista envios da conta. Suporta busca e filtro por modelo.",
      schema: {
        q: z.string().optional().describe("Termo de busca"),
        template_id: z.number().int().optional().describe("Filtrar por ID do modelo"),
        limit: z.number().int().min(1).max(100).optional().default(10).describe("Limite de resultados"),
      },
      handler: async (params: { q?: string; template_id?: number; limit?: number }) => {
        const qs = new URLSearchParams();
        if (params.q) qs.set("q", params.q);
        if (params.template_id) qs.set("template_id", String(params.template_id));
        if (params.limit) qs.set("limit", String(params.limit));

        const result = await client.get(`/api/submissions?${qs.toString()}`);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      },
    },
    {
      name: "cancel_submission" as const,
      description: "Cancela um envio pendente. Envios já completados não podem ser cancelados.",
      schema: {
        submission_id: z.number().int().describe("ID do envio a cancelar"),
      },
      handler: async (params: { submission_id: number }) => {
        const result = await client.delete(`/api/submissions/${params.submission_id}`);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      },
    },
  ];
}
