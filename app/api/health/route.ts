import { NextResponse } from "next/server";
import { databaseConfigured } from "@/app/lib/database";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "moca-delivery",
    databaseConfigured: databaseConfigured(),
    timestamp: new Date().toISOString(),
  });
}
