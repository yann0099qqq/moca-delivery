import fs from "node:fs";
import path from "node:path";
import { agentRoot } from "./config.mjs";

const dataDirectory = path.join(agentRoot, "data");
const ledgerPath = path.join(dataDirectory, "printed-orders.jsonl");
const printed = new Set();

if (fs.existsSync(ledgerPath)) {
  for (const line of fs.readFileSync(ledgerPath, "utf8").split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const entry = JSON.parse(line);
      if (entry.orderId) printed.add(String(entry.orderId));
    } catch {
      // Uma linha danificada não impede a leitura das demais.
    }
  }
}

export function wasPrinted(orderId) {
  return printed.has(String(orderId));
}

export function rememberPrinted(order) {
  fs.mkdirSync(dataDirectory, { recursive: true });
  const entry = JSON.stringify({
    orderId: String(order.id),
    orderNumber: order.orderNumber,
    printedAt: new Date().toISOString(),
  });
  fs.appendFileSync(ledgerPath, `${entry}\n`, "utf8");
  printed.add(String(order.id));
}
