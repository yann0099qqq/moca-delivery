import assert from "node:assert/strict";
import {
  calculateDeliveryFeeCents,
  calculateDeliveryQuote,
  calculateStraightLineDistanceKm,
  normalizeDeliveryLocation,
} from "../app/lib/delivery";
import { calculateOrderDeliveryFeeCents } from "../app/lib/orders";

assert.deepEqual(calculateOrderDeliveryFeeCents("Retirada", undefined), { distanceKm: null, deliveryFeeCents: 0 });
assert.deepEqual(calculateOrderDeliveryFeeCents("Entrega", 8), { distanceKm: 8, deliveryFeeCents: 800 });
assert.deepEqual(calculateOrderDeliveryFeeCents("Entrega", "6,5"), { distanceKm: 6.5, deliveryFeeCents: 650 });
assert.deepEqual(calculateDeliveryFeeCents(101), { distanceKm: 101, deliveryFeeCents: 10_100 });
assert.throws(() => calculateDeliveryFeeCents(-1), /Distância/);
assert.throws(() => normalizeDeliveryLocation({ latitude: 91, longitude: 0 }), /Localização/);

const nearbyDistance = calculateStraightLineDistanceKm(
  { latitude: -7.1352309, longitude: -34.8281061 },
  { latitude: -7.13, longitude: -34.82 },
);
assert.ok(nearbyDistance > 0 && nearbyDistance < 2);

const routeQuote = await calculateDeliveryQuote(
  { latitude: -7.13, longitude: -34.82, accuracyMeters: 15 },
  async () => new Response(JSON.stringify({ routes: [{ distance: 6_540 }] }), { status: 200 }),
);
assert.deepEqual(routeQuote, { distanceKm: 6.5, deliveryFeeCents: 650, source: "route" });

const fallbackQuote = await calculateDeliveryQuote(
  { latitude: -7.13, longitude: -34.82 },
  async () => { throw new Error("offline"); },
);
assert.equal(fallbackQuote.source, "estimate");
assert.ok(fallbackQuote.deliveryFeeCents > 0);

console.log("Localização e cálculo automático da entrega validados.");
