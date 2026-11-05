const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function parsearCuerpo(texto: string): unknown {
  if (!texto) return null;
  try {
    return JSON.parse(texto);
  } catch {
    return texto;
  }
}

function mensajeDeError(data: unknown, status: number): string {
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const candidato =
      (typeof obj.message === "string" && obj.message.trim() && obj.message) ||
      (typeof obj.error === "string" && obj.error.trim() && obj.error);
    if (candidato) return candidato;
  }
  if (typeof data === "string" && data.trim()) return data;
  return `Error ${status}`;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;

  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(init.headers as Record<string, string> | undefined),
      },
    });
  } catch {
    throw new ApiError(0, "No se pudo conectar con el servidor");
  }

  const data = parsearCuerpo(await res.text());

  if (!res.ok) {
    throw new ApiError(res.status, mensajeDeError(data, res.status));
  }

  return data as T;
}
