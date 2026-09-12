import { config, validateConfig } from "./config.mjs";
import { printOrder } from "./printer.mjs";

validateConfig({ allowOffline: true });

const sample = {
  id: "teste-local",
  orderNumber: 9999,
  createdAt: new Date().toISOString(),
  customerName: "Teste de Impressao",
  customerPhone: "(83) 99999-9999",
  customerTaxId: null,
  orderType: "Entrega",
  deliveryAddress: "Rua de teste, 123 - Altiplano, Joao Pessoa",
  deliveryDistanceKm: 8,
  referencePoint: "Proximo ao Moca",
  paymentMethod: "Pix",
  generalNote: "Este e apenas um teste. Nao preparar o pedido.",
  items: [
    { id: "teste-1", name: "Temaki Hot", quantity: 1, unitPriceCents: 2900, totalCents: 2900, note: "Sem cebolinha" },
    { id: "teste-2", name: "Coca-Cola Zero", quantity: 2, unitPriceCents: 900, totalCents: 1800, note: "" },
  ],
  subtotalCents: 4700,
  deliveryFeeCents: 800,
  totalCents: 5500,
  printAttempts: 1,
};

await printOrder(sample);
console.log(`Teste concluído em modo ${config.printerMode}.`);
