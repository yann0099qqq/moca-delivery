import { BUSINESS } from "@/app/data/business";
import type { DeliveryLocation } from "./order-contract";

export type DeliveryQuote = {
  distanceKm: number;
  deliveryFeeCents: number;
  source: "route" | "estimate";
};

const DEFAULT_ROUTING_API_URL = "https://router.project-osrm.org";
const EARTH_RADIUS_KM = 6371;

export function normalizeDeliveryLocation(value: unknown): DeliveryLocation {
  if (!value || typeof value !== "object") throw new Error("Autorize o acesso à sua localização");
  const candidate = value as Record<string, unknown>;
  const latitude = Number(candidate.latitude);
  const longitude = Number(candidate.longitude);
  const accuracyMeters = candidate.accuracyMeters === undefined
    ? undefined
    : Number(candidate.accuracyMeters);

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new Error("Localização inválida");
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new Error("Localização inválida");
  }
  if (accuracyMeters !== undefined && (!Number.isFinite(accuracyMeters) || accuracyMeters < 0)) {
    throw new Error("Precisão da localização inválida");
  }

  return {
    latitude,
    longitude,
    ...(accuracyMeters === undefined ? {} : { accuracyMeters: Math.round(accuracyMeters) }),
  };
}

export function calculateStraightLineDistanceKm(origin: DeliveryLocation, destination: DeliveryLocation) {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const latitudeDelta = radians(destination.latitude - origin.latitude);
  const longitudeDelta = radians(destination.longitude - origin.longitude);
  const originLatitude = radians(origin.latitude);
  const destinationLatitude = radians(destination.latitude);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(originLatitude) * Math.cos(destinationLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function calculateDeliveryFeeCents(distanceKm: number) {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) throw new Error("Distância de entrega inválida");
  const normalizedDistance = Math.round(distanceKm * 10) / 10;
  return {
    distanceKm: normalizedDistance,
    deliveryFeeCents: Math.round(normalizedDistance * BUSINESS.deliveryRatePerKm * 100),
  };
}

export async function calculateDeliveryQuote(
  rawLocation: unknown,
  fetchImplementation: typeof fetch = fetch,
): Promise<DeliveryQuote> {
  const destination = normalizeDeliveryLocation(rawLocation);
  const origin = BUSINESS.location;
  const routerBaseUrl = (process.env.ROUTING_API_URL || DEFAULT_ROUTING_API_URL).replace(/\/$/, "");
  const coordinates = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
  const routeUrl = `${routerBaseUrl}/route/v1/driving/${coordinates}?overview=false&steps=false`;

  try {
    const response = await fetchImplementation(routeUrl, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error("Serviço de rotas indisponível");
    const data = await response.json() as { routes?: Array<{ distance?: number }> };
    const distanceMeters = Number(data.routes?.[0]?.distance);
    if (!Number.isFinite(distanceMeters) || distanceMeters < 0) {
      throw new Error("Rota não encontrada");
    }
    return { ...calculateDeliveryFeeCents(distanceMeters / 1000), source: "route" };
  } catch {
    const estimatedDistance = calculateStraightLineDistanceKm(origin, destination);
    return { ...calculateDeliveryFeeCents(estimatedDistance), source: "estimate" };
  }
}
