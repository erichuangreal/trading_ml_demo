import { NextResponse } from "next/server";
import { LIVE_DEMO_VM_URL } from "@/lib/live-server-config";

export async function POST() {
  let upstream: Response;
  try {
    upstream = await fetch(`${LIVE_DEMO_VM_URL}/run`, { method: "POST", cache: "no-store" });
  } catch {
    return NextResponse.json({ error: "Live demo backend is unreachable." }, { status: 502 });
  }

  const body = await upstream.json().catch(() => ({}));

  if (!upstream.ok) {
    return NextResponse.json(
      { error: body.detail ?? "Could not start today's run." },
      { status: upstream.status }
    );
  }

  return NextResponse.json(body);
}
