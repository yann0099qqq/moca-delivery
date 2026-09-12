import fs from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import { agentRoot, config } from "./config.mjs";
import { renderEscPos, renderPlainTicket } from "./ticket.mjs";

async function printToFile(order) {
  const outputDirectory = path.join(agentRoot, "out");
  await fs.mkdir(outputDirectory, { recursive: true });
  const prefix = `${new Date().toISOString().replace(/[:.]/g, "-")}-pedido-${order.orderNumber}`;
  await Promise.all([
    fs.writeFile(path.join(outputDirectory, `${prefix}.txt`), renderPlainTicket(order, config.paperColumns), "utf8"),
    fs.writeFile(path.join(outputDirectory, `${prefix}.bin`), renderEscPos(order, config.paperColumns)),
  ]);
}

function printToNetwork(order) {
  const data = renderEscPos(order, config.paperColumns);
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: config.printerHost, port: config.printerPort });
    let settled = false;

    const finish = (error) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      if (error) reject(error);
      else resolve();
    };

    socket.setTimeout(config.printerTimeoutMs, () => finish(new Error("Tempo esgotado ao conectar à impressora")));
    socket.once("error", finish);
    socket.once("connect", () => {
      socket.end(data, () => finish());
    });
  });
}

export async function printOrder(order) {
  if (config.printerMode === "network") return printToNetwork(order);
  return printToFile(order);
}
