import { NextResponse } from "next/server";
import { LIVE_DEMO_VM_URL } from "@/lib/live-server-config";
import { transformRun, type RawRun } from "@/lib/live-transform";
import type { LiveStatus } from "@/lib/live-types";

export async function GET() {
  let upstream: Response;
  try {
    upstream = await fetch(`${LIVE_DEMO_VM_URL}/status`, { cache: "no-store" });
  } catch {
    return NextResponse.json({ error: "Live demo backend is unreachable." }, { status: 502 });
  }

  if (!upstream.ok) {
    return NextResponse.json({ error: "Live demo backend returned an error." }, { status: 502 });
  }

  const raw = (await upstream.json()) as {
    date_et: string;
    is_trading_day: boolean;
    market_closed: boolean;
    triggered_today: boolean;
    run: RawRun | null;
    latest_completed_run: RawRun | null;
  };

  const status: LiveStatus = {
    dateEt: raw.date_et,
    isTradingDay: raw.is_trading_day,
    marketClosed: raw.market_closed,
    triggeredToday: raw.triggered_today,
    run: transformRun(raw.run),
    latestCompletedRun: transformRun(raw.latest_completed_run),
  };

  return NextResponse.json(status);
}
