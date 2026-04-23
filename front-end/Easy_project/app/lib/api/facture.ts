import { apiCall } from "@/lib/api/client";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://192.168.1.126:8081/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  if (res.status === 204) {
   
    return undefined as unknown as T;
  }

  const text = await res.text();
  if (!text) {
    return undefined as unknown as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch (err) {
    throw new Error(`Failed to parse JSON response: ${err}`);
  }
}

export type Assigner = {
  id: string;
  locataireId: string;
  appartementId: string;
  statut: string;
  enterAt: string;
  exitAt: string;
};

export type Facture = {
  id: string;
  issuedAt: string;
  duetAt: string;
  amount: number;
  ancienIndex?: number;
  nouveauIndex?: number;
  prixM3?: number;
  type: "FIXE" | "VARIABLE";
  statut: "EN_ATTENTE" | "PAYE" | "EN_RETARD";
  assignerId: string;
};

export type Locataire = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  proprieteId?: string;
};

export type Appartement = {
  id: string;
  nom: string;
  locataireId?: string;
  proprieteId: string;
};

export type Propriete = {
  id: string;
  unites: number;
  residence: string;
};

export type ProprieteCreatePayload = {
  residence: string;
  unites: number;
};

export type ProprieteUpdatePayload = {
  residence: string;
  unites: number;
  appartementIdsToDelete?: string[];
};

export type AppartementPayload = {
  nom: string;
  locataireId?: string;
  proprieteId: string;
};

export function getFactures(): Promise<Facture[]> {
  return apiCall<Facture[]>("/factures");
}

export function getFactureById(factureId: string): Promise<Facture> {
  return request<Facture>(`/factures/${factureId}`);
}

export function getFactureForPortal(factureId: string, locataireId: string): Promise<Facture> {
  return request<Facture>(`/factures/${factureId}/portal?locataireId=${locataireId}`);
}

export function createFacture(facture: Omit<Facture, "id">): Promise<Facture> {
  return apiCall<Facture>("/factures", {
    method: "POST",
    body: JSON.stringify(facture),
  });
}

export function updateFacture(id: string, facture: Omit<Facture, "id">): Promise<Facture> {
  return apiCall<Facture>(`/factures/${id}`, {
    method: "PUT",
    body: JSON.stringify(facture),
  });
}

export function deleteFacture(id: string): Promise<void> {
  return apiCall<void>(`/factures/${id}`, {
    method: "DELETE",
  });
}

export function sendFactureByEmail(id: string): Promise<void> {
  return apiCall<void>(`/factures/${id}/send-email`, {
    method: "POST",
  });
}

export function getLocataires(): Promise<Locataire[]> {
  return apiCall<Locataire[]>("/locataires");
}

export function createLocataire(locataire: Omit<Locataire, "id">): Promise<Locataire> {
  return apiCall<Locataire>("/locataires", {
    method: "POST",
    body: JSON.stringify(locataire),
  });
}

export function updateLocataire(id: string, locataire: Omit<Locataire, "id">): Promise<Locataire> {
  return apiCall<Locataire>(`/locataires/${id}`, {
    method: "PUT",
    body: JSON.stringify(locataire),
  });
}

export function deleteLocataire(id: string): Promise<void> {
  return apiCall<void>(`/locataires/${id}`, {
    method: "DELETE",
  });
}

export function getAppartements(): Promise<Appartement[]> {
  return apiCall<Appartement[]>("/appartements");
}

export function createAppartement(appartement: AppartementPayload): Promise<Appartement> {
  return apiCall<Appartement>("/appartements", {
    method: "POST",
    body: JSON.stringify(appartement),
  });
}

export function updateAppartement(id: string, appartement: AppartementPayload): Promise<Appartement> {
  return apiCall<Appartement>(`/appartements/${id}`, {
    method: "PUT",
    body: JSON.stringify(appartement),
  });
}

export function deleteAppartement(id: string): Promise<void> {
  return apiCall<void>(`/appartements/${id}`, {
    method: "DELETE",
  });
}

export function getProprietes(): Promise<Propriete[]> {
  return apiCall<Propriete[]>("/proprietes");
}

export function createPropriete(propriete: ProprieteCreatePayload): Promise<Propriete> {
  return apiCall<Propriete>("/proprietes", {
    method: "POST",
    body: JSON.stringify(propriete),
  });
}

export function updatePropriete(id: string, propriete: ProprieteUpdatePayload): Promise<Propriete> {
  return apiCall<Propriete>(`/proprietes/${id}`, {
    method: "PUT",
    body: JSON.stringify(propriete),
  });
}

export function deletePropriete(id: string): Promise<void> {
  return apiCall<void>(`/proprietes/${id}`, {
    method: "DELETE",
  });
}

export function getAssignations(): Promise<Assigner[]> {
  return apiCall<Assigner[]>("/assignations");
}

export function createAssigner(assignerId: string, locataireId: string, appartementId: string): Promise<Assigner> {
  return apiCall<Assigner>("/assignations", {
    method: "POST",
    body: JSON.stringify({ locataireId, appartementId }),
  });
}

export function exitAssigner(id: string, exitAt: string): Promise<Assigner> {
  return apiCall<Assigner>(`/assignations/${id}/exit`, {
    method: "PUT",
    body: JSON.stringify({ exitAt }),
  });
}

export function buildLocatairePortalPath(locataireId: string): string {
  return `/espace-locataire/${locataireId}`;
}
export function buildLocatairePortalPath1(locataireId: string): string {
  return `/espace-locataire/${locataireId}`;
}
