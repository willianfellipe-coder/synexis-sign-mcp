const BASE_URL = process.env.SYNEXIS_API_BASE_URL ?? "https://app.synexissign.com";

export class SynexisClient {
  private token: string;
  private baseUrl: string;

  constructor(token?: string, baseUrl?: string) {
    const t = token ?? process.env.SYNEXIS_API_TOKEN;
    if (!t) {
      throw new Error(
        "SYNEXIS_API_TOKEN não configurado. Defina a env var ou passe no construtor."
      );
    }
    this.token = t;
    this.baseUrl = baseUrl ?? BASE_URL;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      "X-Auth-Token": this.token,
      Accept: "application/json",
    };

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const json = await res.json();

    if (!res.ok) {
      const errorMsg = (json as { error?: string })?.error ?? res.statusText;
      throw new Error(`${res.status}: ${errorMsg}`);
    }

    return json as T;
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("PATCH", path, body);
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>("DELETE", path);
  }
}
