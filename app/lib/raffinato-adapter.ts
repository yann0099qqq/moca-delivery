// Ponto único da futura integração fiscal/operacional com o Raffinato.
// Permanece deliberadamente desativado até o fornecedor liberar API,
// credenciais, ambiente de homologação e regras de emissão da NFC-e.

export type RaffinatoOrderPayload = {
  externalOrderId: string;
  customer: Record<string, unknown>;
  delivery: Record<string, unknown>;
  items: Array<Record<string, unknown>>;
  payment: Record<string, unknown>;
  totals: Record<string, unknown>;
};

export async function sendOrderToRaffinato(_payload: RaffinatoOrderPayload) {
  void _payload;
  if (process.env.RAFFINATO_MODE !== "enabled") {
    return { status: "disabled" as const };
  }

  throw new Error(
    "Integração Raffinato ainda não homologada. Não habilite RAFFINATO_MODE antes de receber a documentação oficial.",
  );
}
