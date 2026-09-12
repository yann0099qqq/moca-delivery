import { MENU_ITEMS } from "@/app/data/menu";
import {
  ORDER_TYPES,
  PAYMENT_METHODS,
  PULP_FLAVORS,
  type CreateOrderRequest,
  type PrintableOrder,
  type StoredOrderItem,
} from "./order-contract";
import { calculateDeliveryFeeCents, calculateDeliveryQuote } from "./delivery";
import { ensureOrderSchema, getSql } from "./database";

const flavorBySlug = new Map(
  PULP_FLAVORS.map((flavor) => [
    flavor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(),
    flavor,
  ]),
);

const cleanText = (value: unknown, maxLength: number) =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, maxLength) : "";

const digits = (value: unknown) => cleanText(value, 32).replace(/\D/g, "");

export function calculateOrderDeliveryFeeCents(orderType: unknown, distanceKm: unknown) {
  if (orderType === "Retirada") return { distanceKm: null, deliveryFeeCents: 0 };
  const parsedDistance = typeof distanceKm === "number"
    ? distanceKm
    : Number(String(distanceKm ?? "").replace(",", "."));
  return calculateDeliveryFeeCents(parsedDistance);
}

function isValidTaxId(value: string) {
  if (!value) return true;
  if (!/^\d{11}$|^\d{14}$/.test(value) || /^(\d)\1+$/.test(value)) return false;

  const validateDigit = (base: string, factors: number[]) => {
    const sum = base
      .split("")
      .reduce((total, digit, index) => total + Number(digit) * factors[index], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  if (value.length === 11) {
    const first = validateDigit(value.slice(0, 9), [10, 9, 8, 7, 6, 5, 4, 3, 2]);
    const second = validateDigit(`${value.slice(0, 9)}${first}`, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
    return value.endsWith(`${first}${second}`);
  }

  const first = validateDigit(value.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const second = validateDigit(`${value.slice(0, 12)}${first}`, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return value.endsWith(`${first}${second}`);
}

function resolveMenuItem(requestedId: string) {
  const direct = MENU_ITEMS.find((item) => item.id === requestedId);
  if (direct) return { product: direct, displayName: direct.name };

  if (requestedId.startsWith("suco-polpa-")) {
    const flavorSlug = requestedId.slice("suco-polpa-".length);
    const flavor = flavorBySlug.get(flavorSlug);
    const product = MENU_ITEMS.find((item) => item.id === "suco-polpa");
    if (flavor && product) {
      return { product, displayName: `${product.name} — ${flavor}` };
    }
  }

  return null;
}

export async function createOrder(input: CreateOrderRequest) {
  const customerName = cleanText(input?.customer?.name, 80);
  const customerPhone = digits(input?.customer?.phone);
  const customerTaxId = digits(input?.customer?.taxId);
  const deliveryAddress = cleanText(input?.deliveryAddress, 240);
  const referencePoint = cleanText(input?.referencePoint, 160);
  const generalNote = cleanText(input?.generalNote, 500);
  const idempotencyKey = cleanText(input?.idempotencyKey, 80);

  if (customerName.length < 2) throw new Error("Informe o nome do cliente");
  if (customerPhone.length < 10 || customerPhone.length > 13) throw new Error("Informe um telefone válido");
  if (!isValidTaxId(customerTaxId)) throw new Error("CPF ou CNPJ inválido");
  if (!ORDER_TYPES.includes(input.orderType)) throw new Error("Tipo de pedido inválido");
  if (!PAYMENT_METHODS.includes(input.paymentMethod)) throw new Error("Forma de pagamento inválida");
  if (input.orderType === "Entrega" && deliveryAddress.length < 8) throw new Error("Informe o endereço completo");
  if (input.orderType === "Entrega" && referencePoint.length < 2) throw new Error("Informe o ponto de referência");
  if (!/^[a-zA-Z0-9-]{16,80}$/.test(idempotencyKey)) throw new Error("Identificador do pedido inválido");
  if (!Array.isArray(input.items) || input.items.length < 1 || input.items.length > 50) throw new Error("Pedido sem itens válidos");

  const items: StoredOrderItem[] = input.items.map((entry) => {
    const resolved = resolveMenuItem(cleanText(entry.id, 120));
    const quantity = Number(entry.quantity);
    if (!resolved || !resolved.product.available || resolved.product.price <= 0) {
      throw new Error("Um produto do pedido não está mais disponível");
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new Error("Quantidade inválida no pedido");
    }
    const unitPriceCents = Math.round(resolved.product.price * 100);
    return {
      id: entry.id,
      name: resolved.displayName,
      quantity,
      unitPriceCents,
      totalCents: unitPriceCents * quantity,
      note: cleanText(entry.note, 240),
    };
  });

  const subtotalCents = items.reduce((total, item) => total + item.totalCents, 0);
  const deliveryQuote = input.orderType === "Entrega"
    ? await calculateDeliveryQuote(input.deliveryLocation)
    : { distanceKm: null, deliveryFeeCents: 0 };
  const { distanceKm: deliveryDistanceKm, deliveryFeeCents } = deliveryQuote;
  const totalCents = subtotalCents + deliveryFeeCents;

  if (totalCents >= 50_000 && !customerTaxId) {
    throw new Error("Informe o CPF ou CNPJ para pedidos a partir de R$ 500,00");
  }

  await ensureOrderSchema();
  const sql = getSql();
  const existingOrders = (await sql`
    SELECT id, order_number, created_at, total_cents, print_status
    FROM moca_orders
    WHERE idempotency_key = ${idempotencyKey}
    LIMIT 1
  `) as Array<Record<string, unknown>>;
  if (existingOrders[0]) {
    const existing = existingOrders[0];
    return {
      id: String(existing.id),
      orderNumber: Number(existing.order_number),
      createdAt: new Date(String(existing.created_at)).toISOString(),
      totalCents: Number(existing.total_cents),
      printStatus: String(existing.print_status),
    };
  }

  const recentOrders = (await sql`
    SELECT COUNT(*)::int AS count
    FROM moca_orders
    WHERE customer_phone = ${customerPhone}
      AND created_at > NOW() - INTERVAL '10 minutes'
  `) as Array<Record<string, unknown>>;
  if (Number(recentOrders[0]?.count ?? 0) >= 4) {
    throw new Error("Muitos pedidos recentes para este telefone. Aguarde alguns minutos ou fale pelo WhatsApp");
  }

  const id = crypto.randomUUID();
  const rows = (await sql`
    INSERT INTO moca_orders (
      id, idempotency_key, customer_name, customer_phone, customer_tax_id,
      order_type, delivery_address, delivery_distance_km, reference_point, payment_method,
      general_note, items, subtotal_cents, delivery_fee_cents, total_cents
    ) VALUES (
      ${id}, ${idempotencyKey}, ${customerName}, ${customerPhone}, ${customerTaxId || null},
      ${input.orderType}, ${deliveryAddress || null}, ${deliveryDistanceKm}, ${referencePoint || null}, ${input.paymentMethod},
      ${generalNote || null}, ${JSON.stringify(items)}::jsonb, ${subtotalCents}, ${deliveryFeeCents}, ${totalCents}
    )
    ON CONFLICT (idempotency_key) DO UPDATE SET updated_at = NOW()
    RETURNING id, order_number, created_at, total_cents, print_status
  `) as Array<Record<string, unknown>>;

  const order = rows[0];
  return {
    id: String(order.id),
    orderNumber: Number(order.order_number),
    createdAt: new Date(String(order.created_at)).toISOString(),
    totalCents: Number(order.total_cents),
    printStatus: String(order.print_status),
  };
}

function toPrintableOrder(row: Record<string, unknown>): PrintableOrder {
  return {
    id: String(row.id),
    orderNumber: Number(row.order_number),
    createdAt: new Date(String(row.created_at)).toISOString(),
    customerName: String(row.customer_name),
    customerPhone: String(row.customer_phone),
    customerTaxId: row.customer_tax_id ? String(row.customer_tax_id) : null,
    orderType: row.order_type as PrintableOrder["orderType"],
    deliveryAddress: row.delivery_address ? String(row.delivery_address) : null,
    deliveryDistanceKm: row.delivery_distance_km === null || row.delivery_distance_km === undefined
      ? null
      : Number(row.delivery_distance_km),
    referencePoint: row.reference_point ? String(row.reference_point) : null,
    paymentMethod: row.payment_method as PrintableOrder["paymentMethod"],
    generalNote: row.general_note ? String(row.general_note) : null,
    items: row.items as StoredOrderItem[],
    subtotalCents: Number(row.subtotal_cents),
    deliveryFeeCents: Number(row.delivery_fee_cents),
    totalCents: Number(row.total_cents),
    printAttempts: Number(row.print_attempts),
  };
}

export async function claimNextPrintableOrder(agentId: string) {
  await ensureOrderSchema();
  const sql = getSql();
  const rows = (await sql`
    WITH candidate AS (
      SELECT id
      FROM moca_orders
      WHERE (
        print_status IN ('pending', 'retry')
        AND (next_attempt_at IS NULL OR next_attempt_at <= NOW())
      ) OR (
        print_status = 'printing'
        AND locked_at < NOW() - INTERVAL '2 minutes'
      )
      ORDER BY created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    UPDATE moca_orders
    SET print_status = 'printing',
        print_attempts = print_attempts + 1,
        print_error = NULL,
        printed_by = ${agentId},
        locked_at = NOW(),
        updated_at = NOW()
    WHERE id = (SELECT id FROM candidate)
    RETURNING *
  `) as Array<Record<string, unknown>>;

  if (!rows[0]) return null;
  return toPrintableOrder(rows[0] as Record<string, unknown>);
}

export async function acknowledgePrint(
  orderId: string,
  agentId: string,
  result: "printed" | "failed",
  errorMessage = "",
) {
  await ensureOrderSchema();
  const sql = getSql();

  if (result === "printed") {
    const rows = (await sql`
      UPDATE moca_orders
      SET print_status = 'printed', printed_at = NOW(), printed_by = ${agentId},
          print_error = NULL, locked_at = NULL, next_attempt_at = NULL, updated_at = NOW()
      WHERE id = ${orderId}
      RETURNING id
    `) as Array<Record<string, unknown>>;
    if (!rows[0]) return false;
    await sql`
      INSERT INTO moca_print_events (order_id, agent_id, event_type)
      VALUES (${orderId}, ${agentId}, 'printed')
    `;
    return true;
  }

  const safeError = cleanText(errorMessage, 500) || "Falha de impressão não especificada";
  const rows = (await sql`
    UPDATE moca_orders
    SET print_status = CASE WHEN print_attempts >= 5 THEN 'failed' ELSE 'retry' END,
        print_error = ${safeError}, locked_at = NULL,
        next_attempt_at = CASE WHEN print_attempts >= 5 THEN NULL ELSE NOW() + INTERVAL '30 seconds' END,
        updated_at = NOW()
    WHERE id = ${orderId}
    RETURNING id, print_status
  `) as Array<Record<string, unknown>>;
  if (!rows[0]) return false;
  await sql`
    INSERT INTO moca_print_events (order_id, agent_id, event_type, details)
    VALUES (${orderId}, ${agentId}, ${String(rows[0].print_status)}, ${safeError})
  `;
  return true;
}

const ORDER_STATUSES = ["recebido", "preparando", "pronto", "concluido", "cancelado"] as const;

export async function listRecentOrders(limit = 60) {
  await ensureOrderSchema();
  const sql = getSql();
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  return (await sql`
    SELECT id, order_number, created_at, customer_name, customer_phone, order_type,
           delivery_distance_km, payment_method, items, subtotal_cents,
           delivery_fee_cents, total_cents, status, print_status, print_error
    FROM moca_orders
    ORDER BY created_at DESC
    LIMIT ${safeLimit}
  `) as Array<Record<string, unknown>>;
}

export async function updateOrderFromDashboard(
  orderId: string,
  action: { status?: string; reprint?: boolean },
) {
  await ensureOrderSchema();
  const sql = getSql();
  const safeId = cleanText(orderId, 80);

  if (action.reprint) {
    const rows = (await sql`
      UPDATE moca_orders
      SET print_status = 'pending', print_error = NULL, print_attempts = 0,
          locked_at = NULL, next_attempt_at = NULL, printed_at = NULL, updated_at = NOW()
      WHERE id = ${safeId}
      RETURNING id
    `) as Array<Record<string, unknown>>;
    return Boolean(rows[0]);
  }

  if (!ORDER_STATUSES.includes(action.status as (typeof ORDER_STATUSES)[number])) {
    throw new Error("Status do pedido inválido");
  }
  const rows = (await sql`
    UPDATE moca_orders
    SET status = ${action.status}, updated_at = NOW()
    WHERE id = ${safeId}
    RETURNING id
  `) as Array<Record<string, unknown>>;
  return Boolean(rows[0]);
}
