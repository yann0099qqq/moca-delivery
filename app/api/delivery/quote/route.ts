import { NextResponse } from "next/server";
import { calculateDeliveryQuote } from "@/app/lib/delivery";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = await request.json() as { location?: unknown };
    const quote = await calculateDeliveryQuote(payload.location);
    return NextResponse.json(quote);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível calcular a entrega" },
      { status: 400 },
    );
  }
}
