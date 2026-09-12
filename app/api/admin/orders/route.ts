import { NextResponse } from "next/server";
import { isAdminAuthorized } from "@/app/lib/admin-auth";
import { listRecentOrders } from "@/app/lib/orders";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminAuthorized(request))) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    const orders = await listRecentOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível carregar os pedidos" },
      { status: 500 },
    );
  }
}
