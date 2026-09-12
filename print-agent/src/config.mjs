import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const agentRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function loadEnvFile() {
  const envPath = path.join(agentRoot, ".env");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator < 1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
    process.env[key] ??= value;
  }
}

loadEnvFile();

const numberValue = (name, fallback) => {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const config = {
  apiUrl: (process.env.API_URL ?? "").replace(/\/$/, ""),
  token: process.env.PRINT_AGENT_TOKEN ?? "",
  agentId: process.env.AGENT_ID ?? "moca-balcao-01",
  printerMode: process.env.PRINTER_MODE === "network" ? "network" : "file",
  printerHost: process.env.PRINTER_HOST ?? "",
  printerPort: numberValue("PRINTER_PORT", 9100),
  printerTimeoutMs: numberValue("PRINTER_TIMEOUT_MS", 8000),
  pollIntervalMs: numberValue("POLL_INTERVAL_MS", 3000),
  paperColumns: numberValue("PAPER_COLUMNS", 48),
};

export function validateConfig({ allowOffline = false } = {}) {
  if (!allowOffline && !config.apiUrl.startsWith("https://")) {
    throw new Error("API_URL deve começar com https://");
  }
  if (!allowOffline && config.token.length < 32) {
    throw new Error("PRINT_AGENT_TOKEN deve ter pelo menos 32 caracteres");
  }
  if (config.printerMode === "network" && !config.printerHost) {
    throw new Error("Informe PRINTER_HOST para imprimir pela rede");
  }
}
