import assert from "node:assert/strict";
import { renderPlainTicket } from "../print-agent/src/ticket.mjs";

const ticket = renderPlainTicket({
  orderNumber: 42, createdAt: "2026-09-11T12:00:00.000Z", orderType: "Entrega",
  customerName: "Cliente Teste", customerPhone: "83999999999", customerTaxId: null,
  deliveryAddress: "Rua de Teste, 100", deliveryDistanceKm: 7.5,
  referencePoint: "Próximo à praça", paymentMethod: "Pix",
  items: [{ name: "Uramaki Salmão", quantity: 2, totalCents: 5980, note: "" }],
  subtotalCents: 5980, deliveryFeeCents: 750, totalCents: 6730, generalNote: "",
}, 48);

assert.match(ticket, /PEDIDO #42/);
assert.match(ticket, /DISTANCIA: 7.5 km/);
assert.match(ticket, /ENTREGA\s+R\$ 7,50/);
assert.match(ticket, /TOTAL\s+R\$ 67,30/);
assert.match(ticket, /PEDIDO NAO FISCAL/);

console.log("Cupom ESC\/POS validado.");
