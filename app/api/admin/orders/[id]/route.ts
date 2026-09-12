import { NextResponse } from "next/server";
import { isAdminAuthorized } from "@/app/lib/admin-auth";
import { updateOrderFromDashboard } from "@/app/lib/orders";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { status?: string; reprint?: boolean };
    const updated = await updateOrderFromDashboard(id, body);
    return updated
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível atualizar o pedido" },
      { status: 400 },
    );
  }
}
