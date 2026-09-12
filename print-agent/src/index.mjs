import { config, validateConfig } from "./config.mjs";
import { rememberPrinted, wasPrinted } from "./ledger.mjs";
import { printOrder } from "./printer.mjs";

validateConfig();

let running = true;
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const headers = () => ({
  Authorization: `Bearer ${config.token}`,
  "X-Agent-Id": config.agentId,
});

async function acknowledge(orderId, result, error = "") {
  const response = await fetch(`${config.apiUrl}/api/print-agent/orders/${orderId}/ack`, {
    method: "POST",
    headers: { ...headers(), "Content-Type": "application/json" },
    body: JSON.stringify({ result, error }),
  });
  if (!response.ok) throw new Error(`Falha ao confirmar impressão: HTTP ${response.status}`);
}

async function checkHealth() {
  const response = await fetch(`${config.apiUrl}/api/print-agent/health`, { headers: headers() });
  if (!response.ok) throw new Error(`Servidor recusou o agente: HTTP ${response.status}`);
  const health = await response.json();
  if (!health.database) throw new Error("Banco de pedidos ainda não configurado no servidor");
}

async function poll() {
  const response = await fetch(`${config.apiUrl}/api/print-agent/next`, {
    headers: headers(),
    cache: "no-store",
  });
  if (response.status === 204) return;
  if (!response.ok) throw new Error(`Falha ao consultar pedidos: HTTP ${response.status}`);

  const { order } = await response.json();
  if (!order?.id) return;

  if (wasPrinted(order.id)) {
    await acknowledge(order.id, "printed");
    console.log(`${new Date().toISOString()} pedido #${order.orderNumber} já impresso; confirmação reenviada`);
    return;
  }

  try {
    await printOrder(order);
    rememberPrinted(order);
    await acknowledge(order.id, "printed");
    console.log(`${new Date().toISOString()} pedido #${order.orderNumber} impresso com sucesso`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`${new Date().toISOString()} falha no pedido #${order.orderNumber}: ${message}`);
    try {
      await acknowledge(order.id, "failed", message);
    } catch (ackError) {
      console.error(`${new Date().toISOString()} falha ao registrar o erro: ${ackError}`);
    }
  }
}

process.on("SIGINT", () => { running = false; });
process.on("SIGTERM", () => { running = false; });

console.log(`${new Date().toISOString()} Moca Print Agent iniciado (${config.agentId}, modo ${config.printerMode})`);

while (running) {
  try {
    await checkHealth();
    break;
  } catch (error) {
    console.error(`${new Date().toISOString()} aguardando servidor: ${error.message}`);
    await sleep(10_000);
  }
}

while (running) {
  try {
    await poll();
  } catch (error) {
    console.error(`${new Date().toISOString()} ${error.message}`);
  }
  await sleep(config.pollIntervalMs);
}

console.log(`${new Date().toISOString()} Moca Print Agent encerrado`);
