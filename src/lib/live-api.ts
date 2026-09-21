"use client";

import type { AuditLogEntry, LiveStatus } from "./live-types";

export async function fetchLiveStatus(): Promise<LiveStatus> {
  const res = await fetch("/api/live-demo/status", { cache: "no-store" });
  if (!res.ok) throw new Error("Could not reach the live demo backend.");
  return res.json();
}

export async function fetchAuditLog(): Promise<AuditLogEntry[]> {
  const res = await fetch("/api/live-demo/audit-log", { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.entries ?? [];
}

export async function triggerLiveRun(): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch("/api/live-demo/run", { method: "POST" });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: body.error ?? "Could not start today's run." };
  return { ok: true };
}
