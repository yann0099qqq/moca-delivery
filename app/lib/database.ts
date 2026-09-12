import { neon } from "@neondatabase/serverless";

let sqlClient: ReturnType<typeof neon> | null = null;
let schemaReady: Promise<void> | null = null;

export function databaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL não configurada");
  }

  sqlClient ??= neon(databaseUrl);
  return sqlClient;
}

export function ensureOrderSchema() {
  if (schemaReady) return schemaReady;

  schemaReady = (async () => {
    const sql = getSql();

    await sql`
      CREATE TABLE IF NOT EXISTS moca_orders (
        id TEXT PRIMARY KEY,
        order_number BIGSERIAL UNIQUE NOT NULL,
        idempotency_key TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_tax_id TEXT,
        order_type TEXT NOT NULL,
        delivery_address TEXT,
        delivery_distance_km NUMERIC(6,1),
        reference_point TEXT,
        payment_method TEXT NOT NULL,
        general_note TEXT,
        items JSONB NOT NULL,
        subtotal_cents INTEGER NOT NULL,
        delivery_fee_cents INTEGER NOT NULL,
        total_cents INTEGER NOT NULL,
        source TEXT NOT NULL DEFAULT 'site',
        status TEXT NOT NULL DEFAULT 'recebido',
        print_status TEXT NOT NULL DEFAULT 'pending',
        print_attempts INTEGER NOT NULL DEFAULT 0,
        print_error TEXT,
        locked_at TIMESTAMPTZ,
        next_attempt_at TIMESTAMPTZ,
        printed_at TIMESTAMPTZ,
        printed_by TEXT,
        raffinato_status TEXT NOT NULL DEFAULT 'aguardando_integracao',
        raffinato_external_id TEXT,
        fiscal_status TEXT NOT NULL DEFAULT 'nao_solicitado'
      )
    `;

    await sql`
      ALTER TABLE moca_orders
      ADD COLUMN IF NOT EXISTS delivery_distance_km NUMERIC(6,1)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS moca_orders_print_queue_idx
      ON moca_orders (print_status, next_attempt_at, created_at)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS moca_orders_phone_created_idx
      ON moca_orders (customer_phone, created_at DESC)
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS moca_print_events (
        id BIGSERIAL PRIMARY KEY,
        order_id TEXT NOT NULL REFERENCES moca_orders(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        agent_id TEXT,
        event_type TEXT NOT NULL,
        details TEXT
      )
    `;
  })().catch((error) => {
    schemaReady = null;
    throw error;
  });

  return schemaReady;
}
