import { z } from "zod";
import type { SynexisClient } from "../client.js";
import { registerTemplateTools } from "./templates.js";
import { registerSubmissionTools } from "./submissions.js";
import { registerContactTools } from "./contacts.js";
import { registerWebhookTools } from "./webhooks.js";
import { registerAccountTools } from "./account.js";

export interface McpTool {
  name: string;
  description: string;
  schema: Record<string, z.ZodTypeAny>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (params: any) => Promise<{
    content: Array<{ type: "text"; text: string }>;
  }>;
}

export function registerAllTools(client: SynexisClient): McpTool[] {
  return [
    ...registerTemplateTools(client),
    ...registerSubmissionTools(client),
    ...registerContactTools(client),
    ...registerWebhookTools(client),
    ...registerAccountTools(client),
  ] as McpTool[];
}
