export const ORDER_TYPES = ["Entrega", "Retirada"] as const;
export const PAYMENT_METHODS = ["Pix", "Crédito", "Débito", "Dinheiro"] as const;
export const PULP_FLAVORS = ["Morango", "Uva", "Graviola", "Cajá", "Maracujá"] as const;

export type OrderType = (typeof ORDER_TYPES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type OrderRequestItem = {
  id: string;
  quantity: number;
  note?: string;
};

export type DeliveryLocation = {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
};

export type CreateOrderRequest = {
  idempotencyKey: string;
  customer: {
    name: string;
    phone: string;
    taxId?: string;
  };
  orderType: OrderType;
  deliveryAddress?: string;
  deliveryLocation?: DeliveryLocation;
  referencePoint?: string;
  paymentMethod: PaymentMethod;
  generalNote?: string;
  items: OrderRequestItem[];
  website?: string;
};

export type StoredOrderItem = {
  id: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  note: string;
};

export type PrintableOrder = {
  id: string;
  orderNumber: number;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerTaxId: string | null;
  orderType: OrderType;
  deliveryAddress: string | null;
  deliveryDistanceKm: number | null;
  referencePoint: string | null;
  paymentMethod: PaymentMethod;
  generalNote: string | null;
  items: StoredOrderItem[];
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  printAttempts: number;
};
