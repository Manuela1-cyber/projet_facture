import { apiCall } from "./client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresInMs: number;
  tokenType?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
}

export interface UserMeResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
}

type ApiEnvelope<T> = {
  data?: T;
};

type LoginPayload = {
  accessToken?: string;
  access_token?: string;
  token?: string;
  expiresInMs?: number;
  expiresIn?: number;
  expires_in?: number;
  tokenType?: string;
  token_type?: string;
};

function extractPayload<T>(value: unknown): T {
  if (!value || typeof value !== "object") {
    return value as T;
  }

  const maybeEnvelope = value as ApiEnvelope<T>;
  if (maybeEnvelope.data !== undefined) {
    return maybeEnvelope.data;
  }

  return value as T;
}

function normalizeLoginResponse(value: unknown): LoginResponse {
  const payload = extractPayload<LoginPayload>(value);

  if (!payload || typeof payload !== "object") {
    throw new Error("Réponse de connexion invalide.");
  }

  const accessToken = payload.accessToken ?? payload.access_token ?? payload.token;
  if (!accessToken) {
    throw new Error("Token d'authentification introuvable dans la réponse.");
  }

  const expiresInMs =
    payload.expiresInMs ??
    payload.expiresIn ??
    payload.expires_in ??
    0;

  return {
    accessToken,
    expiresInMs,
    tokenType: payload.tokenType ?? payload.token_type,
  };
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await apiCall<unknown>("/auth/login", {
    method: "POST",
    body: JSON.stringify(request),
  });

  return normalizeLoginResponse(response);
}

export async function register(request: RegisterRequest): Promise<UserMeResponse> {
  const response = await apiCall<unknown>("/auth/register", {
    method: "POST",
    body: JSON.stringify(request),
  });

  return extractPayload<UserMeResponse>(response);
}

export async function getCurrentUser(): Promise<UserMeResponse> {
  const response = await apiCall<unknown>("/auth/me", {
    method: "GET",
  });

  return extractPayload<UserMeResponse>(response);
}

export function saveAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("authToken", token);
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
}

export function clearAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
  }
}
