import { NextResponse } from "next/server";
import { isPrintAgentAuthorized } from "@/app/lib/agent-auth";
import { claimNextPrintableOrder } from "@/app/lib/orders";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isPrintAgentAuthorized(request))) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const agentId = request.headers.get("x-agent-id")?.trim().slice(0, 80) || "moca-print-agent";
  try {
    const order = await claimNextPrintableOrder(agentId);
    if (!order) return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
    return NextResponse.json({ order }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha ao consultar fila" },
      { status: 500 },
    );
  }
}
