import { z } from "zod";
import type { SynexisClient } from "../client.js";

export function registerWebhookTools(client: SynexisClient) {
  return [
    {
      name: "list_webhooks" as const,
      description:
        "Lista os webhooks configurados na conta. Webhooks notificam sobre eventos de envio e assinatura.",
      schema: {
        limit: z.number().int().min(1).max(100).optional().default(10).describe("Limite de resultados"),
      },
      handler: async (params: { limit?: number }) => {
        const qs = new URLSearchParams();
        if (params.limit) qs.set("limit", String(params.limit));

        const result = await client.get(`/api/webhooks?${qs.toString()}`);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      },
    },
  ];
}
