import { NextResponse } from "next/server";
import { LIVE_DEMO_VM_URL } from "@/lib/live-server-config";
import type { AuditLogEntry } from "@/lib/live-types";

export async function GET() {
  let upstream: Response;
  try {
    upstream = await fetch(`${LIVE_DEMO_VM_URL}/audit-log`, { cache: "no-store" });
  } catch {
    return NextResponse.json({ entries: [] as AuditLogEntry[] }, { status: 502 });
  }

  if (!upstream.ok) {
    return NextResponse.json({ entries: [] as AuditLogEntry[] }, { status: 502 });
  }

  const raw = (await upstream.json()) as {
    entries: { triggered_at_et: string; trading_day: string; result: string }[];
  };

  const entries: AuditLogEntry[] = raw.entries.map((e) => ({
    triggeredAtEt: e.triggered_at_et,
    tradingDay: e.trading_day,
    result: e.result,
  }));

  return NextResponse.json({ entries });
}
