import { z } from "zod";

// ── API response wrappers ──

export interface Pagination {
  count: number;
  next: number | null;
  prev: number | null;
}

export interface ApiListResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface ApiError {
  error: string;
}

// ── Template ──

export interface TemplateAuthor {
  email: string;
  first_name: string;
  last_name: string;
}

export interface TemplateDocument {
  id: number;
  filename: string;
  preview_image_url: string;
}

export interface TemplateField {
  uuid: string;
  submitter_uuid: string;
  name: string;
  type: string;
  required: boolean;
  readonly: boolean;
  default_value: unknown;
  title: string;
  description: string;
  options: unknown[];
}

export interface TemplateSubmitter {
  uuid: string;
  name: string;
  email: string;
  role: string;
  order: number;
}

export interface Template {
  id: number;
  name: string;
  slug: string;
  external_id: string | null;
  application_key: string | null;
  folder_name: string | null;
  shared_link: string | null;
  source: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  author: TemplateAuthor;
  submitters: TemplateSubmitter[];
  fields: TemplateField[];
  documents: TemplateDocument[];
}

// ── Submission ──

export interface SubmissionSubmitter {
  id: number;
  slug: string;
  uuid: string;
  name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  empresa: string | null;
  role: string;
  status: string;
  sent_at: string | null;
  opened_at: string | null;
  completed_at: string | null;
  declined_at: string | null;
  external_id: string | null;
  metadata: Record<string, unknown>;
  values: Record<string, string>;
}

export interface Submission {
  id: number;
  name: string;
  slug: string;
  source: string;
  status: string;
  submitters_order: string;
  created_at: string;
  updated_at: string;
  expire_at: string | null;
  archived_at: string | null;
  canceled_at: string | null;
  template: { id: number; name: string; slug: string } | null;
  created_by_user: { email: string } | null;
  submitters: SubmissionSubmitter[];
  documents: unknown[];
  audit_log_url: string | null;
  combined_document_url: string | null;
}

// ── Contact ──

export interface Contact {
  id: number;
  uuid: string;
  name: string;
  email: string;
  cpf: string;
  empresa: string;
  created_at: string;
  updated_at: string;
}

// ── Webhook ──

export interface Webhook {
  id: number;
  url: string;
  events: string[];
  created_at: string;
  updated_at: string;
  hmac_secret: string;
}

// ── Account usage ──

export interface AccountUsage {
  plan: { key: string; name: string };
  usage: Record<string, number>;
  period_end: string;
}

// ── Tool parameter schemas (Zod) ──

export const ListTemplatesSchema = z.object({
  q: z.string().optional().describe("Termo de busca por nome do modelo"),
  folder: z.string().optional().describe("Nome da pasta"),
  limit: z.number().int().min(1).max(100).optional().default(10),
});

export const GetTemplateSchema = z.object({
  template_id: z.number().int().describe("ID do modelo"),
});

export const CreateTemplateFromPdfSchema = z.object({
  name: z.string().min(1).describe("Nome do modelo"),
  file_base64: z.string().describe("Arquivo PDF em base64"),
  external_id: z.string().optional().describe("ID externo para upsert"),
  folder_name: z.string().optional().describe("Nome da pasta de destino"),
});

export const CreateTemplateFromHtmlSchema = z.object({
  name: z.string().min(1).describe("Nome do modelo"),
  html: z.string().min(1).describe("Conteúdo HTML do documento"),
  external_id: z.string().optional().describe("ID externo para upsert"),
  folder_name: z.string().optional().describe("Nome da pasta de destino"),
});

export const CreateSubmissionSchema = z.object({
  template_id: z.number().int().describe("ID do modelo a enviar"),
  submitters: z
    .array(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        cpf: z.string().optional(),
        phone: z.string().optional(),
        role: z.string().optional(),
        metadata: z.record(z.string()).optional(),
        values: z.record(z.string()).optional(),
      })
    )
    .min(1)
    .max(50)
    .describe("Lista de signatários (1-50)"),
  name: z.string().optional().describe("Nome do envio (usa nome do modelo se omitido)"),
  send_email: z.boolean().optional().default(true),
  message_subject: z.string().optional(),
  message_body: z.string().optional(),
});

export const GetSubmissionSchema = z.object({
  submission_id: z.number().int().describe("ID do envio"),
});

export const ListSubmissionsSchema = z.object({
  q: z.string().optional().describe("Termo de busca"),
  template_id: z.number().int().optional().describe("Filtrar por modelo"),
  limit: z.number().int().min(1).max(100).optional().default(10),
});

export const CancelSubmissionSchema = z.object({
  submission_id: z.number().int().describe("ID do envio a cancelar"),
});

export const ListContactsSchema = z.object({
  q: z.string().optional().describe("Busca por nome, email ou CPF"),
  limit: z.number().int().min(1).max(100).optional().default(10),
});

export const CreateContactSchema = z.object({
  name: z.string().min(1).describe("Nome completo"),
  email: z.string().email().describe("E-mail do contato"),
  cpf: z.string().optional().describe("CPF (apenas números)"),
  empresa: z.string().optional().describe("Nome da empresa"),
});

export const UpdateContactSchema = z.object({
  contact_id: z.number().int().describe("ID do contato"),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  cpf: z.string().optional(),
  empresa: z.string().optional(),
});

export const DeleteContactSchema = z.object({
  contact_id: z.number().int().describe("ID do contato"),
});

export const ListWebhooksSchema = z.object({
  limit: z.number().int().min(1).max(100).optional().default(10),
});

export type ListTemplatesParams = z.infer<typeof ListTemplatesSchema>;
export type GetTemplateParams = z.infer<typeof GetTemplateSchema>;
export type CreateTemplateFromPdfParams = z.infer<typeof CreateTemplateFromPdfSchema>;
export type CreateTemplateFromHtmlParams = z.infer<typeof CreateTemplateFromHtmlSchema>;
export type CreateSubmissionParams = z.infer<typeof CreateSubmissionSchema>;
export type GetSubmissionParams = z.infer<typeof GetSubmissionSchema>;
export type ListSubmissionsParams = z.infer<typeof ListSubmissionsSchema>;
export type CancelSubmissionParams = z.infer<typeof CancelSubmissionSchema>;
export type ListContactsParams = z.infer<typeof ListContactsSchema>;
export type CreateContactParams = z.infer<typeof CreateContactSchema>;
export type UpdateContactParams = z.infer<typeof UpdateContactSchema>;
export type DeleteContactParams = z.infer<typeof DeleteContactSchema>;
export type ListWebhooksParams = z.infer<typeof ListWebhooksSchema>;
