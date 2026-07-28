import type { Escalation, Level, Reason, Verdict } from "@reba/core";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type Checkin = {
  id: string;
  motherId: string;
  intakeMode: "checklist" | "free_text";
  rawText: string | null;
  level: Level;
  protocolFloor: Level;
  reasons: Reason[];
  escalations: Escalation[];
  handover: string | null;
  acknowledgedAt: string | null;
  createdAt: string;
};

export type Mother = {
  id: string;
  name: string;
  caregiverName: string;
  caregiverPhone: string | null;
  chwName: string;
  facility: string;
  deliveryType: "vaginal" | "caesarean";
  birthAt: string;
  riskFactors: string[];
};

export type MotherRow = Mother & { latestCheckin: Checkin | null };
export type MotherDetail = Mother & { checkins: Checkin[] };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Something went wrong. Try again.");
  }
  return response.json() as Promise<T>;
}

export const api = {
  mothers: () => request<MotherRow[]>("/api/mothers"),
  mother: (id: string) => request<MotherDetail>(`/api/mothers/${id}`),
  submitCheck: (id: string, payload: { answers?: unknown[]; text?: string }) =>
    request<{ checkin: Checkin; verdict: Verdict }>(`/api/mothers/${id}/checkins`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  acknowledge: (motherId: string, checkinId: string) =>
    request<Checkin>(`/api/mothers/${motherId}/checkins/${checkinId}/acknowledge`, {
      method: "POST",
    }),
  evaluation: () => request<import("@reba/core").EvalReport>("/api/eval"),
};
