import { z } from "zod";
import type { SynexisClient } from "../client.js";

export function registerContactTools(client: SynexisClient) {
  return [
    {
      name: "list_contacts" as const,
      description: "Lista contatos da agenda. Suporta busca por nome, e-mail ou CPF.",
      schema: {
        q: z.string().optional().describe("Busca por nome, e-mail ou CPF"),
        limit: z.number().int().min(1).max(100).optional().default(10).describe("Limite de resultados"),
      },
      handler: async (params: { q?: string; limit?: number }) => {
        const qs = new URLSearchParams();
        if (params.q) qs.set("q", params.q);
        if (params.limit) qs.set("limit", String(params.limit));

        const result = await client.get(`/api/contacts?${qs.toString()}`);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      },
    },
    {
      name: "create_contact" as const,
      description: "Cria um novo contato na agenda. Nome e e-mail são obrigatórios.",
      schema: {
        name: z.string().min(1).describe("Nome completo"),
        email: z.string().email().describe("E-mail do contato"),
        cpf: z.string().optional().describe("CPF — apenas números"),
        empresa: z.string().optional().describe("Nome da empresa"),
      },
      handler: async (params: { name: string; email: string; cpf?: string; empresa?: string }) => {
        const contact: Record<string, string> = { name: params.name, email: params.email };
        if (params.cpf) contact.cpf = params.cpf;
        if (params.empresa) contact.empresa = params.empresa;

        const result = await client.post("/api/contacts", { contact });
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      },
    },
    {
      name: "update_contact" as const,
      description: "Atualiza um contato existente. Apenas os campos enviados são alterados.",
      schema: {
        contact_id: z.number().int().describe("ID do contato"),
        name: z.string().min(1).optional().describe("Novo nome"),
        email: z.string().email().optional().describe("Novo e-mail"),
        cpf: z.string().optional().describe("Novo CPF"),
        empresa: z.string().optional().describe("Nova empresa"),
      },
      handler: async (params: { contact_id: number; name?: string; email?: string; cpf?: string; empresa?: string }) => {
        const { contact_id, ...fields } = params;
        const result = await client.patch(`/api/contacts/${contact_id}`, { contact: fields });
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      },
    },
    {
      name: "delete_contact" as const,
      description: "Remove um contato da agenda permanentemente.",
      schema: {
        contact_id: z.number().int().describe("ID do contato"),
      },
      handler: async (params: { contact_id: number }) => {
        const result = await client.delete(`/api/contacts/${params.contact_id}`);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      },
    },
  ];
}
