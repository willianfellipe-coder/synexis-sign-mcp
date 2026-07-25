import type { SynexisClient } from "../client.js";

export function registerAccountTools(client: SynexisClient) {
  return [
    {
      name: "get_account_usage" as const,
      description:
        "Retorna o uso atual da conta: plano, consumo de envelopes, armazenamento e data de renovação.",
      schema: {},
      handler: async () => {
        const result = await client.get("/api/account/usage");
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      },
    },
  ];
}
