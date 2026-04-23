const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.1.126:8081/api";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
};
  // Ajouter le token JWT s'il existe
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message ||
        error.error ||
        `HTTP Error: ${response.status} ${response.statusText}`
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Réponse API invalide (JSON attendu).");
  }
}
