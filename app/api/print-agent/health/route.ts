import { NextResponse } from "next/server";
import { isPrintAgentAuthorized } from "@/app/lib/agent-auth";
import { databaseConfigured } from "@/app/lib/database";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isPrintAgentAuthorized(request))) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, database: databaseConfigured(), fiscal: "disabled" });
}
