import { NextResponse } from "next/server";
import { isPrintAgentAuthorized } from "@/app/lib/agent-auth";
import { acknowledgePrint } from "@/app/lib/orders";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await isPrintAgentAuthorized(request))) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as { result?: string; error?: string };
  if (body.result !== "printed" && body.result !== "failed") {
    return NextResponse.json({ error: "Resultado inválido" }, { status: 400 });
  }

  const agentId = request.headers.get("x-agent-id")?.trim().slice(0, 80) || "moca-print-agent";
  try {
    const updated = await acknowledgePrint(id, agentId, body.result, body.error);
    return updated
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha ao confirmar impressão" },
      { status: 500 },
    );
  }
}
