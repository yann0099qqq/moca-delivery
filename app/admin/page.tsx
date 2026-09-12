"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./admin.module.css";

type Order = {
  id: string;
  order_number: number;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  order_type: string;
  delivery_distance_km: number | null;
  payment_method: string;
  items: Array<{ name: string; quantity: number }>;
  total_cents: number;
  status: string;
  print_status: string;
  print_error: string | null;
};

const money = (cents: number) => new Intl.NumberFormat("pt-BR", {
  style: "currency", currency: "BRL",
}).format(cents / 100);

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [draftToken, setDraftToken] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async (activeToken = token) => {
    if (!activeToken) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${activeToken}` },
        cache: "no-store",
      });
      const data = (await response.json()) as { orders?: Order[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Falha ao carregar pedidos");
      setOrders(data.orders ?? []);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Falha ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const initialTimer = window.setTimeout(() => void loadOrders(token), 0);
    const timer = window.setInterval(() => void loadOrders(token), 15000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, [token, loadOrders]);

  const summary = useMemo(() => ({
    received: orders.filter((order) => order.status === "recebido").length,
    preparing: orders.filter((order) => order.status === "preparando").length,
    ready: orders.filter((order) => order.status === "pronto").length,
    pendingPrint: orders.filter((order) => !["printed", "impresso"].includes(order.print_status)).length,
  }), [orders]);

  const authenticate = () => {
    const normalized = draftToken.trim();
    if (!normalized) return;
    window.sessionStorage.setItem("moca-admin-token", normalized);
    setToken(normalized);
  };

  const updateOrder = async (id: string, body: { status?: string; reprint?: boolean }) => {
    setError("");
    const response = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error || "Falha ao atualizar pedido");
      return;
    }
    await loadOrders();
  };

  if (!token) {
    return <main className={styles.page}><section className={styles.login}>
      <div className={styles.brand}>moca<span>.</span></div>
      <h1>Painel de pedidos</h1>
      <p>Acesso reservado à equipe. Use o token administrativo configurado no ambiente.</p>
      <label><span>Token de acesso</span><input type="password" value={draftToken} onChange={(event) => setDraftToken(event.target.value)} onKeyDown={(event) => event.key === "Enter" && authenticate()} /></label>
      <button className={styles.button} type="button" onClick={authenticate}>Entrar no painel</button>
    </section></main>;
  }

  return <main className={styles.page}><div className={styles.shell}>
    <header className={styles.header}><div className={styles.brand}>moca<span>.</span></div><Link href="/">Abrir cardápio</Link></header>
    <section className={styles.toolbar}><div><h1>Pedidos em tempo real</h1><p>Atualização automática a cada 15 segundos.</p></div><button className={styles.button} type="button" onClick={() => void loadOrders()}>{loading ? "Atualizando…" : "Atualizar agora"}</button></section>
    <section className={styles.summary} aria-label="Resumo dos pedidos">
      <article><span>Recebidos</span><strong>{summary.received}</strong></article>
      <article><span>Preparando</span><strong>{summary.preparing}</strong></article>
      <article><span>Prontos</span><strong>{summary.ready}</strong></article>
      <article><span>Impressão pendente</span><strong>{summary.pendingPrint}</strong></article>
    </section>
    {error ? <p className={styles.error}>{error}</p> : null}
    <section className={styles.orders}>
      {orders.length ? orders.map((order) => <article className={styles.order} key={order.id}>
        <div className={styles.orderTop}><div><h2>Pedido #{order.order_number}</h2><small>{new Date(order.created_at).toLocaleString("pt-BR")}</small></div><span className={styles.badge}>{order.status}</span></div>
        <div className={styles.meta}>
          <div><span>Cliente</span><strong>{order.customer_name}</strong></div>
          <div><span>Tipo</span><strong>{order.order_type}{order.delivery_distance_km ? ` · ${order.delivery_distance_km} km` : ""}</strong></div>
          <div><span>Pagamento</span><strong>{order.payment_method}</strong></div>
          <div><span>Total</span><strong>{money(order.total_cents)}</strong></div>
        </div>
        <p className={styles.items}>{order.items.map((item) => `${item.quantity}× ${item.name}`).join(" · ")}</p>
        <p className={styles.muted}>Impressão: {order.print_status}{order.print_error ? ` — ${order.print_error}` : ""}</p>
        <div className={styles.actions}>
          <button type="button" onClick={() => void updateOrder(order.id, { status: "preparando" })}>Preparando</button>
          <button type="button" onClick={() => void updateOrder(order.id, { status: "pronto" })}>Pronto</button>
          <button type="button" onClick={() => void updateOrder(order.id, { status: "concluido" })}>Concluído</button>
          <button type="button" onClick={() => void updateOrder(order.id, { status: "cancelado" })}>Cancelar</button>
          <button type="button" onClick={() => void updateOrder(order.id, { reprint: true })}>Reimprimir</button>
        </div>
      </article>) : <div className={styles.empty}>{loading ? "Carregando pedidos…" : "Nenhum pedido encontrado."}</div>}
    </section>
  </div></main>;
}
