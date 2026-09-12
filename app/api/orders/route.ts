import { NextResponse } from "next/server";
import type { CreateOrderRequest } from "@/app/lib/order-contract";
import { createOrder } from "@/app/lib/orders";
import { databaseConfigured } from "@/app/lib/database";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!databaseConfigured()) {
    return NextResponse.json(
      { error: "O recebimento automático está em configuração. Finalize pelo WhatsApp." },
      { status: 503 },
    );
  }

  try {
    const payload = (await request.json()) as CreateOrderRequest;
    const order = await createOrder(payload);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível registrar o pedido";
    const status = /configurad/i.test(message) ? 503 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
