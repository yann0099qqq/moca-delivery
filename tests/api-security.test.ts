import assert from "node:assert/strict";
import { POST as createOrder } from "../app/api/orders/route";
import { GET as printAgentHealth } from "../app/api/print-agent/health/route";
import { GET as adminOrders } from "../app/api/admin/orders/route";
import { PAYMENT_METHODS } from "../app/lib/order-contract";

delete process.env.DATABASE_URL;
delete process.env.PRINT_AGENT_TOKEN;
delete process.env.ADMIN_TOKEN;

const orderResponse = await createOrder(new Request("https://moca.test/api/orders", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: "{}",
}));
assert.equal(orderResponse.status, 503, "API pública deve falhar de forma segura sem banco");

const agentResponse = await printAgentHealth(
  new Request("https://moca.test/api/print-agent/health"),
);
assert.equal(agentResponse.status, 401, "Fila de impressão deve rejeitar agente sem token");

const adminResponse = await adminOrders(new Request("https://moca.test/api/admin/orders"));
assert.equal(adminResponse.status, 401, "Painel deve rejeitar acesso sem token");
assert.equal(PAYMENT_METHODS.includes("Voucher" as never), false, "Voucher não deve estar disponível");

console.log("Contratos de segurança da API validados.");
