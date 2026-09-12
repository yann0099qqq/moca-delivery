"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { BUSINESS } from "./data/business";
import {
  BEVERAGE_FILTERS,
  CATEGORY_FILTERS,
  MENU_ITEMS,
  MOCA_IMAGE,
  type MenuCategory,
  type MenuItem,
} from "./data/menu";
import {
  PAYMENT_METHODS,
  PULP_FLAVORS,
  type CreateOrderRequest,
  type DeliveryLocation,
  type PaymentMethod,
} from "./lib/order-contract";

type CartEntry = {
  product: MenuItem;
  quantity: number;
  note: string;
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const WINE_ITEMS = MENU_ITEMS.filter((item) => item.subcategory?.startsWith("Vinho"));
const COCKTAIL_ITEMS = MENU_ITEMS.filter((item) => item.subcategory === "Drinks");
const TEMAKI_ITEMS = MENU_ITEMS.filter((item) => item.category === "Temaki");
const BEVERAGE_GROUPS = ["Águas", "Refrigerantes", "Sucos", "Cafés"] as const;
type BeverageGroup = (typeof BEVERAGE_GROUPS)[number];
const NON_ALCOHOL_ITEMS = MENU_ITEMS.filter((item) =>
  BEVERAGE_GROUPS.includes(item.subcategory as BeverageGroup),
);
const BAR_GROUPS = ["Cervejas", "Whiskys", "Doses"] as const;
type BarGroup = (typeof BAR_GROUPS)[number];
const BAR_ITEMS = MENU_ITEMS.filter((item) =>
  BAR_GROUPS.includes(item.subcategory as BarGroup),
);
const SIGNATURE_ITEM = MENU_ITEMS.find((item) => item.id === "temaki-moca-especial");

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 8.5h14l-1 12H6l-1-12Z" />
      <path d="M9 9V6a3 3 0 0 1 6 0v3" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

function MenuCard({ item, onAdd }: { item: MenuItem; onAdd: (item: MenuItem) => void }) {
  const canOrder = item.available && item.price > 0 && item.priceLabel !== "Consultar";

  return (
    <article className={`menu-card ${!canOrder ? "is-unavailable" : ""}`}>
      <div className="card-image-wrap">
        <Image
          src={item.image}
          alt={item.imageAlt}
          width={1600}
          height={1000}
          unoptimized
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.src = MOCA_IMAGE;
          }}
        />
        <div className="card-labels">
          <span>{item.subcategory ?? item.category}</span>
          {item.badge ? <span className="promo-label">{item.badge}</span> : null}
        </div>
        {!canOrder ? (
          <strong className="unavailable-label">{item.available ? "PREÇO EM BREVE" : "INDISPONÍVEL"}</strong>
        ) : null}
      </div>

      <div className="card-content">
        <div className="card-title-row">
          <h3>{item.name}</h3>
          {item.pieces ? <span>{item.pieces} peças</span> : null}
        </div>
        <p>{item.description}</p>
        {item.volume ? <small>{item.volume}</small> : null}
        <div className="card-action-row">
          <strong>{item.priceLabel ?? currency.format(item.price)}</strong>
          <button type="button" onClick={() => onAdd(item)} disabled={!canOrder}>
            <span>{canOrder ? "Adicionar" : item.available ? "Em breve" : "Indisponível"}</span>
            <b aria-hidden="true">+</b>
          </button>
        </div>
      </div>
    </article>
  );
}

function BeverageCatalogCard({ item, onAdd }: { item: MenuItem; onAdd: (item: MenuItem) => void }) {
  const canOrder = item.available && item.price > 0 && item.priceLabel !== "Consultar";

  return (
    <article className="beverage-catalog-card">
      <div className="beverage-photo">
        <Image
          src={item.image}
          alt={item.imageAlt}
          width={1600}
          height={1000}
          unoptimized
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.src = MOCA_IMAGE;
          }}
        />
        <span>{item.subcategory}</span>
      </div>
      <div className="beverage-card-body">
        <div>
          <h3>{item.name}</h3>
          <p>{item.volume ?? "Informação no cardápio"}</p>
        </div>
        <div className="beverage-price-row">
          <strong>{item.priceLabel ?? currency.format(item.price)}</strong>
          <button
            type="button"
            onClick={() => onAdd(item)}
            disabled={!canOrder}
            aria-label={canOrder ? `Adicionar ${item.name} ao pedido` : `Preço de ${item.name} será adicionado`}
          >
            <span>{canOrder ? "Adicionar" : "Em breve"}</span><b>{canOrder ? "+" : "…"}</b>
          </button>
        </div>
      </div>
    </article>
  );
}

function TemakiCatalogCard({
  item,
  index,
  onAdd,
}: {
  item: MenuItem;
  index: number;
  onAdd: (item: MenuItem) => void;
}) {
  const isSignature = item.id === "temaki-moca-especial";

  return (
    <article className={`temaki-catalog-card ${isSignature ? "is-signature" : ""}`}>
      <div className="temaki-card-image">
        <Image
          src={item.image}
          alt={item.imageAlt}
          width={1600}
          height={1000}
          unoptimized
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.src = MOCA_IMAGE;
          }}
        />
        <span className="temaki-card-number">{String(index + 1).padStart(2, "0")}</span>
        <span className="temaki-card-category">{isSignature ? "Especial Moca" : "Moca Temakis"}</span>
      </div>
      <div className="temaki-card-body">
        <div>
          <h3>{item.name}</h3>
          <p>{item.description}</p>
        </div>
        <div className="temaki-card-footer">
          <strong>{item.priceLabel ?? currency.format(item.price)}</strong>
          <button
            type="button"
            onClick={() => onAdd(item)}
            disabled={!item.available}
            aria-label={`Adicionar ${item.name} ao pedido`}
          >
            <span>{item.available ? "Adicionar" : "Indisponível"}</span>
            <b aria-hidden="true">+</b>
          </button>
        </div>
      </div>
    </article>
  );
}

function BarCatalogCard({ item, onAdd }: { item: MenuItem; onAdd: (item: MenuItem) => void }) {
  return (
    <article className="bar-catalog-card">
      <div className="bar-card-info">
        <Image src={item.image} alt="" width={1600} height={1000} unoptimized loading="lazy" />
        <div className="bar-card-copy">
          <span>{item.volume ?? item.subcategory}</span>
          <h3>{item.name}</h3>
        </div>
      </div>
      <div className="bar-card-action">
        <strong>{item.priceLabel ?? currency.format(item.price)}</strong>
        <button
          type="button"
          onClick={() => onAdd(item)}
          aria-label={`Adicionar ${item.name} ao pedido`}
        >
          <span>Adicionar</span>
          <b aria-hidden="true">+</b>
        </button>
      </div>
    </article>
  );
}

export default function Home() {
  const [category, setCategory] = useState<MenuCategory>("Destaques");
  const [beverageFilter, setBeverageFilter] = useState("Todas");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [flavorPickerOpen, setFlavorPickerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [beverageGroup, setBeverageGroup] = useState<BeverageGroup>("Águas");
  const [barGroup, setBarGroup] = useState<BarGroup>("Cervejas");
  const [generalNote, setGeneralNote] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerTaxId, setCustomerTaxId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Pix");
  const [orderType, setOrderType] = useState<"Entrega" | "Retirada">("Entrega");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation | null>(null);
  const [deliveryDistanceKm, setDeliveryDistanceKm] = useState<number | null>(null);
  const [deliveryFeeCents, setDeliveryFeeCents] = useState(0);
  const [locationStatus, setLocationStatus] = useState<"idle" | "locating" | "calculating" | "ready" | "estimate" | "error">("idle");
  const [referencePoint, setReferencePoint] = useState("");
  const [toast, setToast] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [pendingOrderKey, setPendingOrderKey] = useState("");
  const [lastOrder, setLastOrder] = useState<{
    number: number;
    whatsappUrl: string;
  } | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("moca-sushi-cart");
    if (!saved) return;
    try {
      // O carrinho é restaurado somente após a hidratação para manter o HTML inicial estável.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCart(JSON.parse(saved) as CartEntry[]);
    } catch {
      window.localStorage.removeItem("moca-sushi-cart");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("moca-sushi-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    document.body.style.overflow = cartOpen || flavorPickerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, flavorPickerOpen]);

  useEffect(() => {
    if (!flavorPickerOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFlavorPickerOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [flavorPickerOpen]);

  const visibleItems = useMemo(() => {
    const query = normalize(search.trim());

    return MENU_ITEMS.filter((item) => {
      const haystack = normalize(
        [item.name, item.description, item.category, item.subcategory].filter(Boolean).join(" "),
      );
      const matchesSearch = !query || haystack.includes(query);

      const matchesCategory = query
        ? true
        : category === "Destaques"
          ? item.featured
          : category === "Promoções"
            ? item.badge?.toLowerCase().includes("promo")
            : category === "Vinhos"
              ? item.subcategory?.startsWith("Vinho")
              : category === "Drinks"
                ? item.subcategory === "Drinks"
                : item.category === category;

      const matchesBeverage =
        query ||
        category !== "Bebidas" ||
        beverageFilter === "Todas" ||
        item.subcategory === beverageFilter;

      return Boolean(matchesSearch && matchesCategory && matchesBeverage);
    });
  }, [category, beverageFilter, search]);

  const cartCount = cart.reduce((sum, entry) => sum + entry.quantity, 0);
  const subtotal = cart.reduce((sum, entry) => sum + entry.product.price * entry.quantity, 0);
  const deliveryFee = orderType === "Entrega" ? deliveryFeeCents / 100 : 0;
  const orderTotal = subtotal + deliveryFee;
  const visibleBarItems = BAR_ITEMS.filter((item) => item.subcategory === barGroup);
  const visibleBeverageItems = NON_ALCOHOL_ITEMS.filter((item) => item.subcategory === beverageGroup);

  const jumpToCategory = (nextCategory: MenuCategory) => {
    setCategory(nextCategory);
    setSearch("");
    setMenuOpen(false);
    window.setTimeout(() => {
      document.getElementById("cardapio")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 30);
  };

  const addToCart = (product: MenuItem) => {
    setCart((current) => {
      const existing = current.find((entry) => entry.product.id === product.id);
      if (existing) {
        return current.map((entry) =>
          entry.product.id === product.id
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry,
        );
      }
      return [...current, { product, quantity: 1, note: "" }];
    });
    setToast(`${product.name} adicionado ao pedido`);
  };

  const requestAdd = (product: MenuItem) => {
    if (product.id === "suco-polpa") {
      setFlavorPickerOpen(true);
      return;
    }
    addToCart(product);
  };

  const selectPulpFlavor = (flavor: (typeof PULP_FLAVORS)[number]) => {
    const baseProduct = MENU_ITEMS.find((item) => item.id === "suco-polpa");
    if (!baseProduct) return;
    const flavorId = normalize(flavor).replace(/\s+/g, "-");
    addToCart({
      ...baseProduct,
      id: `${baseProduct.id}-${flavorId}`,
      name: `${baseProduct.name} — ${flavor}`,
      description: `${baseProduct.description} Sabor escolhido: ${flavor}.`,
    });
    setFlavorPickerOpen(false);
  };

  const changeQuantity = (id: string, delta: number) => {
    setCart((current) =>
      current
        .map((entry) =>
          entry.product.id === id
            ? { ...entry, quantity: Math.max(0, entry.quantity + delta) }
            : entry,
        )
        .filter((entry) => entry.quantity > 0),
    );
  };

  const changeItemNote = (id: string, note: string) => {
    setCart((current) =>
      current.map((entry) => (entry.product.id === id ? { ...entry, note } : entry)),
    );
  };

  const requestDeliveryLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      setToast("Este navegador não permite obter sua localização");
      return;
    }

    setLocationStatus("locating");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location: DeliveryLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: position.coords.accuracy,
        };
        setLocationStatus("calculating");
        try {
          const response = await fetch("/api/delivery/quote", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ location }),
          });
          const result = await response.json() as {
            distanceKm?: number;
            deliveryFeeCents?: number;
            source?: "route" | "estimate";
            error?: string;
          };
          if (!response.ok || result.distanceKm === undefined || result.deliveryFeeCents === undefined) {
            throw new Error(result.error || "Não foi possível calcular a entrega");
          }
          setDeliveryLocation(location);
          setDeliveryDistanceKm(result.distanceKm);
          setDeliveryFeeCents(result.deliveryFeeCents);
          setLocationStatus(result.source === "route" ? "ready" : "estimate");
          setToast("Localização confirmada e entrega calculada");
        } catch (error) {
          setDeliveryLocation(null);
          setDeliveryDistanceKm(null);
          setDeliveryFeeCents(0);
          setLocationStatus("error");
          setToast(error instanceof Error ? error.message : "Não foi possível calcular a entrega");
        }
      },
      (error) => {
        setDeliveryLocation(null);
        setDeliveryDistanceKm(null);
        setDeliveryFeeCents(0);
        setLocationStatus("error");
        const message = error.code === error.PERMISSION_DENIED
          ? "Permita o acesso à localização para calcular a entrega"
          : "Não foi possível identificar sua localização";
        setToast(message);
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    );
  };

  const finishOrder = async () => {
    if (!cart.length) return;
    if (!customerName.trim()) {
      setToast("Informe seu nome para finalizar o pedido");
      return;
    }
    const phoneDigits = customerPhone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      setToast("Informe um telefone válido para contato");
      return;
    }
    if (orderTotal >= 500 && customerTaxId.replace(/\D/g, "").length < 11) {
      setToast("Informe o CPF ou CNPJ para pedidos a partir de R$ 500,00");
      return;
    }
    if (orderType === "Entrega" && !deliveryAddress.trim()) {
      setToast("Informe o endereço ou localização da entrega");
      return;
    }
    if (orderType === "Entrega" && (!deliveryLocation || deliveryDistanceKm === null)) {
      setToast("Use sua localização para calcular a entrega");
      return;
    }
    if (orderType === "Entrega" && !referencePoint.trim()) {
      setToast("Informe um ponto de referência");
      return;
    }

    const lines = cart.flatMap((entry) => {
      const subtotal = entry.product.price * entry.quantity;
      const productLine = `${entry.quantity}x ${entry.product.name} — ${currency.format(subtotal)}`;
      return entry.note.trim()
        ? [productLine, `   Observação: ${entry.note.trim()}`]
        : [productLine];
    });

    const orderKey = pendingOrderKey || window.crypto.randomUUID();
    if (!pendingOrderKey) setPendingOrderKey(orderKey);

    const payload: CreateOrderRequest = {
      idempotencyKey: orderKey,
      customer: {
        name: customerName.trim(),
        phone: customerPhone.trim(),
        taxId: customerTaxId.trim() || undefined,
      },
      orderType,
      deliveryAddress: orderType === "Entrega" ? deliveryAddress.trim() : undefined,
      deliveryLocation: orderType === "Entrega" ? deliveryLocation ?? undefined : undefined,
      referencePoint: orderType === "Entrega" ? referencePoint.trim() : undefined,
      paymentMethod,
      generalNote: generalNote.trim() || undefined,
      items: cart.map((entry) => ({
        id: entry.product.id,
        quantity: entry.quantity,
        note: entry.note.trim() || undefined,
      })),
      website: window.location.origin,
    };

    setSubmittingOrder(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        order?: { orderNumber: number };
        error?: string;
      };
      if (!response.ok || !result.order) {
        throw new Error(result.error || "Não foi possível registrar o pedido");
      }

      const message = [
      `Olá, Moca Sushi! Confirmação do pedido #${result.order.orderNumber}:`,
      "",
      "Identificação:",
      `Nome: ${customerName.trim()}`,
      `Telefone: ${customerPhone.trim()}`,
      customerTaxId.trim() ? `CPF/CNPJ: ${customerTaxId.trim()}` : null,
      `Tipo do pedido: ${orderType}`,
      orderType === "Entrega" ? `Localização/Endereço: ${deliveryAddress.trim()}` : null,
      orderType === "Entrega" && deliveryDistanceKm !== null
        ? `Distância: ${deliveryDistanceKm.toLocaleString("pt-BR")} km`
        : null,
      orderType === "Entrega" ? `Ponto de referência: ${referencePoint.trim()}` : null,
      "",
      ...lines,
      "",
      `Subtotal: ${currency.format(subtotal)}`,
      orderType === "Entrega" ? `Taxa de entrega: ${currency.format(deliveryFee)}` : null,
      `Total: ${currency.format(orderTotal)}`,
      `Pagamento: ${paymentMethod}`,
      generalNote.trim() ? "" : null,
      generalNote.trim() ? `Observação geral: ${generalNote.trim()}` : null,
    ]
      .filter((line): line is string => line !== null)
      .join("\n");

      setLastOrder({
        number: result.order.orderNumber,
        whatsappUrl: `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(message)}`,
      });
      setPendingOrderKey("");
      setCart([]);
      setGeneralNote("");
      setDeliveryLocation(null);
      setDeliveryDistanceKm(null);
      setDeliveryFeeCents(0);
      setLocationStatus("idle");
      setCartOpen(false);
      setToast(`Pedido #${result.order.orderNumber} enviado para o Moca`);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Não foi possível enviar o pedido");
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <main>
      <div className="top-note">Carta completa: 21 vinhos · 20 drinks · pedido direto ao Moca</div>

      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Moca Sushi — início">
          <span className="brand-mark">moca<span>.</span></span>
          <small>SUSHI &amp; JAPONESA</small>
        </a>

        <button
          className="mobile-menu-button"
          type="button"
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span />
          <span />
        </button>

        <nav className={menuOpen ? "is-open" : ""} aria-label="Navegação principal">
          <a href="#inicio" onClick={() => setMenuOpen(false)}>Início</a>
          <a href="#temakis" onClick={() => setMenuOpen(false)}>Temakis</a>
          <button type="button" onClick={() => jumpToCategory("Destaques")}>Cardápio</button>
          <a href="#bebidas" onClick={() => setMenuOpen(false)}>Bebidas</a>
          <a href="#carta-vinhos" onClick={() => setMenuOpen(false)}>Vinhos</a>
          <a href="#drinks-completos" onClick={() => setMenuOpen(false)}>Drinks</a>
          <a href="#bar-moca" onClick={() => setMenuOpen(false)}>Bar</a>
        </nav>

        <button className="header-order" type="button" onClick={() => jumpToCategory("Destaques")}>
          Pedir agora
          <ArrowIcon />
        </button>
      </header>

      <section className="hero" id="inicio">
        <Image
          src={MOCA_IMAGE}
          alt="Moca"
          width={1600}
          height={1000}
          unoptimized
          fetchPriority="high"
          decoding="async"
        />
        <div className="hero-shade" />
        <div className="japanese-stamp" aria-hidden="true">鮨</div>
        <div className="hero-content shell">
          <p className="eyebrow"><span /> Culinária japonesa</p>
          <h1>MOCA<br /><em>SUSHI</em></h1>
          <p className="hero-copy">Sabor, qualidade e tradição em cada peça.</p>
          <div className="hero-catalog-note">
            <span>21 vinhos</span><i /> <span>20 drinks</span><i /> <span>cardápio completo</span>
          </div>
          <div className="hero-actions">
            <button className="primary-button" type="button" onClick={() => jumpToCategory("Destaques")}>
              Ver cardápio <ArrowIcon />
            </button>
            <button className="secondary-button" type="button" onClick={() => jumpToCategory("Destaques")}>
              Fazer pedido
            </button>
          </div>
        </div>
        <div className="hero-service-card" aria-label="Horários do Moca">
          <span>Horários do Moca</span>
          <div>
            <small>Almoço</small>
            <strong>{BUSINESS.lunchHours}</strong>
          </div>
          <div>
            <small>Sushi</small>
            <strong>{BUSINESS.sushiHours}</strong>
          </div>
        </div>
        <div className="hero-scroll">Role para descobrir <span>↓</span></div>
      </section>

      <section className="experience-strip shell" aria-label="Diferenciais">
        <article>
          <b>01</b>
          <div><strong>Escolha fácil</strong><span>Cardápio organizado por categorias</span></div>
        </article>
        <article>
          <b>02</b>
          <div><strong>Pedido completo</strong><span>Itens, quantidades e observações</span></div>
        </article>
        <article>
          <b>03</b>
          <div><strong>Direto no WhatsApp</strong><span>Mensagem pronta para confirmar</span></div>
        </article>
      </section>

      {SIGNATURE_ITEM ? (
        <section className="signature-showcase" aria-labelledby="assinatura-moca">
          <div className="signature-grid shell">
            <div className="signature-visual">
              <Image src={SIGNATURE_ITEM.image} alt={SIGNATURE_ITEM.imageAlt} width={1600} height={1000} unoptimized loading="lazy" />
              <span className="signature-japanese" aria-hidden="true">特別</span>
              <div className="signature-number">01</div>
            </div>
            <div className="signature-copy">
              <p className="eyebrow"><span /> Assinatura da casa</p>
              <h2 id="assinatura-moca">Temaki<br /><em>Moca Especial</em></h2>
              <p>{SIGNATURE_ITEM.description}</p>
              <div className="signature-footer">
                <div><small>Valor</small><strong>{currency.format(SIGNATURE_ITEM.price)}</strong></div>
                <button type="button" onClick={() => addToCart(SIGNATURE_ITEM)}>
                  Adicionar ao pedido <ArrowIcon />
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="temaki-collection" id="temakis" aria-labelledby="titulo-temakis">
        <div className="shell">
          <div className="temaki-collection-heading">
            <div>
              <p className="eyebrow"><span /> Feitos na hora</p>
              <h2 id="titulo-temakis">Moca <em>Temakis</em></h2>
            </div>
            <div className="temaki-collection-intro">
              <strong>{TEMAKI_ITEMS.length} opções</strong>
              <p>Todos acompanham arroz, nori, cream cheese, cebolinha e gergelim, salvo indicação.</p>
            </div>
          </div>

          <div className="temaki-catalog-grid">
            {TEMAKI_ITEMS.map((item, index) => (
              <TemakiCatalogCard key={item.id} item={item} index={index} onAdd={requestAdd} />
            ))}
          </div>
        </div>
      </section>

      <section className="menu-section" id="cardapio">
        <div className="shell">
          <div className="section-heading">
            <div>
              <p className="eyebrow"><span /> Do balcão para sua mesa</p>
              <h2>Nosso <em>Cardápio</em></h2>
            </div>
            <p>Explore os itens disponíveis no menu Moca.</p>
          </div>

          <label className="search-box">
            <SearchIcon />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="O que você está procurando?"
              aria-label="Buscar produto pelo nome"
            />
            {search ? <button type="button" onClick={() => setSearch("")}>Limpar</button> : null}
          </label>

          <div className="category-row" aria-label="Categorias do cardápio">
            {CATEGORY_FILTERS.map((item) => (
              <button
                type="button"
                key={item}
                className={!search && category === item ? "active" : ""}
                onClick={() => {
                  setCategory(item);
                  setSearch("");
                }}
              >
                {item}
              </button>
            ))}
          </div>

          {!search && category === "Bebidas" ? (
            <div className="subcategory-row" aria-label="Tipos de bebida">
              {BEVERAGE_FILTERS.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={beverageFilter === item ? "active" : ""}
                  onClick={() => setBeverageFilter(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          ) : null}

          <div className="results-meta">
            <p>{search ? <>Resultados para <strong>“{search}”</strong></> : <strong>{category}</strong>}</p>
            <span>{visibleItems.length} {visibleItems.length === 1 ? "item" : "itens"}</span>
          </div>

          {visibleItems.length ? (
            <div className="product-grid">
              {visibleItems.map((item) => <MenuCard key={item.id} item={item} onAdd={requestAdd} />)}
            </div>
          ) : (
            <div className="empty-state">
              <span>近日</span>
              <h3>{search ? "Nenhum produto encontrado" : "Categoria pronta para receber produtos"}</h3>
              <p>
                {search
                  ? "Tente buscar por outro nome, como “temaki”, “hot” ou “água”."
                  : "Os itens desta categoria ainda não foram enviados. A estrutura já está preparada para a atualização."}
              </p>
              {search ? <button type="button" onClick={() => setSearch("")}>Ver destaques</button> : null}
            </div>
          )}
        </div>
      </section>

      <section className="beverage-collection refreshment-collection" id="bebidas" aria-labelledby="titulo-bebidas">
        <div className="shell">
          <div className="collection-heading">
            <div>
              <p className="eyebrow"><span /> Para acompanhar</p>
              <h2 id="titulo-bebidas">Nossas <em>Bebidas</em></h2>
            </div>
            <div className="collection-summary">
              <strong>{NON_ALCOHOL_ITEMS.length} opções</strong>
              <p>Águas, refrigerantes, sucos e cafés.</p>
            </div>
          </div>

          <div className="bar-tabs refreshment-tabs" role="tablist" aria-label="Categorias de bebidas">
            {BEVERAGE_GROUPS.map((group) => (
              <button
                key={group}
                type="button"
                role="tab"
                aria-selected={beverageGroup === group}
                className={beverageGroup === group ? "active" : ""}
                onClick={() => setBeverageGroup(group)}
              >
                <span>{group}</span>
                <small>{NON_ALCOHOL_ITEMS.filter((item) => item.subcategory === group).length}</small>
              </button>
            ))}
          </div>

          <div className="refreshment-note">
            <p><strong>{beverageGroup}</strong></p>
            <span>{visibleBeverageItems.length} {visibleBeverageItems.length === 1 ? "opção" : "opções"}</span>
          </div>

          <div className="beverage-catalog-grid">
            {visibleBeverageItems.map((item) => (
              <BeverageCatalogCard key={`beverage-${item.id}`} item={item} onAdd={requestAdd} />
            ))}
          </div>
        </div>
      </section>

      <section className="beverage-collection wine-collection" id="carta-vinhos">
        <div className="shell">
          <div className="collection-heading">
            <div>
              <p className="eyebrow"><span /> Seleção completa</p>
              <h2>Carta de <em>Vinhos</em></h2>
            </div>
            <div className="collection-summary">
              <strong>{WINE_ITEMS.length} rótulos</strong>
              <p>Brancos, tintos, rosé e vinho verde.</p>
            </div>
          </div>
          <div className="collection-groups" aria-label="Tipos de vinho">
            <span>7 brancos</span><span>1 verde</span><span>1 rosé</span><span>12 tintos</span>
          </div>
          <div className="beverage-catalog-grid">
            {WINE_ITEMS.map((item) => (
              <BeverageCatalogCard key={`wine-${item.id}`} item={item} onAdd={requestAdd} />
            ))}
          </div>
        </div>
      </section>

      <section className="beverage-collection cocktail-collection" id="drinks-completos">
        <div className="shell">
          <div className="collection-heading">
            <div>
              <p className="eyebrow"><span /> Coquetelaria Moca</p>
              <h2>Todos os <em>Drinks</em></h2>
            </div>
            <div className="collection-summary">
              <strong>{COCKTAIL_ITEMS.length} opções</strong>
              <p>Clássicos e refrescantes.</p>
            </div>
          </div>
          <div className="beverage-catalog-grid">
            {COCKTAIL_ITEMS.map((item) => (
              <BeverageCatalogCard key={`cocktail-${item.id}`} item={item} onAdd={requestAdd} />
            ))}
          </div>
        </div>
      </section>

      <section className="bar-collection" id="bar-moca" aria-labelledby="titulo-bar-moca">
        <div className="shell">
          <div className="bar-hero-grid">
            <div className="bar-hero-copy">
              <p className="eyebrow"><span /> Carta do bar</p>
              <h2 id="titulo-bar-moca">Bar <em>Moca</em></h2>
              <p>Cervejas geladas, whiskys em dose ou garrafa e uma seleção completa de destilados.</p>
              <div className="bar-stats" aria-label="Resumo da carta do bar">
                <div><strong>04</strong><span>Cervejas</span></div>
                <div><strong>14</strong><span>Whiskys</span></div>
                <div><strong>20</strong><span>Doses</span></div>
              </div>
            </div>
            <div className="bar-hero-photos" aria-label="Bebidas disponíveis no Moca">
              <figure className="bar-photo-main">
                <Image src={MOCA_IMAGE} alt="Moca" width={1600} height={1000} unoptimized loading="lazy" />
                <figcaption>Whiskys selecionados</figcaption>
              </figure>
              <figure>
                <Image src={MOCA_IMAGE} alt="Moca" width={1600} height={1000} unoptimized loading="lazy" />
                <figcaption>Destilados &amp; doses</figcaption>
              </figure>
            </div>
          </div>

          <div className="bar-tabs" role="tablist" aria-label="Categorias do bar">
            {BAR_GROUPS.map((group) => (
              <button
                key={group}
                type="button"
                role="tab"
                aria-selected={barGroup === group}
                className={barGroup === group ? "active" : ""}
                onClick={() => setBarGroup(group)}
              >
                <span>{group}</span>
                <small>{BAR_ITEMS.filter((item) => item.subcategory === group).length}</small>
              </button>
            ))}
          </div>

          <div className="bar-results-heading">
            <div>
              <small>Exibindo</small>
              <h3>{barGroup}</h3>
            </div>
            <span>{visibleBarItems.length} {visibleBarItems.length === 1 ? "opção" : "opções"}</span>
          </div>

          <div className="bar-catalog-grid">
            {visibleBarItems.map((item) => (
              <BarCatalogCard key={`bar-${item.id}`} item={item} onAdd={requestAdd} />
            ))}
          </div>
        </div>
      </section>

      <section className="about-section" id="contato">
        <div className="about-grid shell">
          <div className="about-copy">
            <p className="eyebrow"><span /> Visite o Moca</p>
            <h2>Seu momento<br /><em>merece sabor.</em></h2>
            <p>Descubra o sabor do Altiplano em uma experiência contemporânea, com almoço e sushi self-service.</p>
            <a href={BUSINESS.instagramUrl} target="_blank" rel="noreferrer">
              {BUSINESS.instagramHandle} <ArrowIcon />
            </a>
          </div>

          <div className="info-panel">
            <article><span>01</span><div><small>Endereço</small><strong>{BUSINESS.address}</strong></div></article>
            <article><span>02</span><div><small>WhatsApp</small><strong>{BUSINESS.whatsappDisplay}</strong></div></article>
            <article><span>03</span><div><small>Almoço self-service</small><strong>{BUSINESS.lunchHours}</strong></div></article>
            <article><span>04</span><div><small>Sushi self-service</small><strong>{BUSINESS.sushiHours}</strong></div></article>
            <article><span>05</span><div><small>Pagamento</small><strong>{BUSINESS.payments}</strong></div></article>
            <article><span>06</span><div><small>Retirada e entrega</small><strong>{BUSINESS.pickup}. {BUSINESS.delivery}.</strong></div></article>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-main shell">
          <div>
            <a className="brand brand-footer" href="#inicio">
              <span className="brand-mark">moca<span>.</span></span>
              <small>SUSHI &amp; JAPONESA</small>
            </a>
            <p>Sabor japonês feito para você.</p>
          </div>
          <div className="footer-links">
            <button type="button" onClick={() => jumpToCategory("Destaques")}>Cardápio</button>
            <a href="#carta-vinhos">Vinhos</a>
            <a href="#drinks-completos">Drinks</a>
            <button type="button" onClick={() => jumpToCategory("Bebidas")}>Bebidas</button>
            <a href="#contato">Contato</a>
            <a href={BUSINESS.instagramUrl} target="_blank" rel="noreferrer">Instagram</a>
            <a href={`https://wa.me/${BUSINESS.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a>
            <a href="/privacidade">Privacidade</a>
          </div>
        </div>
        <div className="footer-bottom shell">
          <span>© 2026 Moca Sushi. Todos os direitos reservados.</span>
          <span>Cardápio digital do Moca.</span>
        </div>
      </footer>

      <button className="floating-cart" type="button" onClick={() => setCartOpen(true)} aria-label={`Abrir pedido com ${cartCount} itens`}>
        <BagIcon />
        <span><strong>Seu pedido</strong><small>{cartCount ? `${cartCount} ${cartCount === 1 ? "item" : "itens"}` : "Carrinho vazio"}</small></span>
        <b>{cartCount ? currency.format(orderTotal) : "+"}</b>
      </button>

      <div
        className={`flavor-picker-backdrop ${flavorPickerOpen ? "is-open" : ""}`}
        onClick={() => setFlavorPickerOpen(false)}
        aria-hidden="true"
      />
      <section
        className={`flavor-picker ${flavorPickerOpen ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!flavorPickerOpen}
        aria-labelledby="titulo-sabor-polpa"
      >
        <button className="flavor-picker-close" type="button" onClick={() => setFlavorPickerOpen(false)} aria-label="Fechar opções de sabor">×</button>
        <p className="eyebrow"><span /> Personalize sua bebida</p>
        <h2 id="titulo-sabor-polpa">Escolha o <em>sabor</em></h2>
        <p>Qual sabor você deseja para o seu suco de polpa?</p>
        <div className="flavor-options">
          {PULP_FLAVORS.map((flavor, index) => (
            <button key={flavor} type="button" onClick={() => selectPulpFlavor(flavor)}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{flavor}</strong>
              <b aria-hidden="true">→</b>
            </button>
          ))}
        </div>
      </section>

      <div className={`drawer-backdrop ${cartOpen ? "is-open" : ""}`} onClick={() => setCartOpen(false)} />
      <aside className={`cart-drawer ${cartOpen ? "is-open" : ""}`} aria-hidden={!cartOpen} aria-label="Seu pedido">
        <div className="drawer-header">
          <div><span>Seu pedido</span><h2>{cartCount} {cartCount === 1 ? "item" : "itens"}</h2></div>
          <button type="button" onClick={() => setCartOpen(false)} aria-label="Fechar carrinho">×</button>
        </div>

        <div className="drawer-body">
          {cart.length ? <>
            {cart.map((entry) => (
              <article className="cart-item" key={entry.product.id}>
              <Image src={entry.product.image} alt="" width={1600} height={1000} unoptimized />
              <div className="cart-item-info">
                <div><h3>{entry.product.name}</h3><strong>{currency.format(entry.product.price * entry.quantity)}</strong></div>
                <div className="quantity-control">
                  <button type="button" onClick={() => changeQuantity(entry.product.id, -1)} aria-label="Diminuir quantidade">−</button>
                  <span>{entry.quantity}</span>
                  <button type="button" onClick={() => changeQuantity(entry.product.id, 1)} aria-label="Aumentar quantidade">+</button>
                  <button className="remove-item" type="button" onClick={() => setCart((current) => current.filter((item) => item.product.id !== entry.product.id))}>Excluir</button>
                </div>
                <label>
                  <span>Observação do item</span>
                  <input
                    value={entry.note}
                    onChange={(event) => changeItemNote(entry.product.id, event.target.value)}
                    placeholder="Ex.: sem cream cheese"
                  />
                </label>
              </div>
              </article>
            ))}

            <section className="customer-identification" aria-labelledby="identificacao-pedido">
              <div className="identification-heading">
                <span>Antes de finalizar</span>
                <h3 id="identificacao-pedido">Identificação do pedido</h3>
              </div>

              <label>
                <span>Seu nome *</span>
                <input
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder="Digite seu nome"
                />
              </label>

              <label>
                <span>Telefone/WhatsApp *</span>
                <input
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  placeholder="(83) 99999-9999"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </label>

              <label>
                <span>CPF ou CNPJ <small>(obrigatório acima de R$ 500)</small></span>
                <input
                  value={customerTaxId}
                  onChange={(event) => setCustomerTaxId(event.target.value)}
                  placeholder="Opcional para pedidos menores"
                  inputMode="numeric"
                />
              </label>

              <label>
                <span>Forma de pagamento *</span>
                <select
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
                >
                  {PAYMENT_METHODS.map((method) => <option key={method}>{method}</option>)}
                </select>
              </label>

              <div className="order-type" aria-label="Tipo do pedido">
                <button
                  type="button"
                  className={orderType === "Entrega" ? "active" : ""}
                  onClick={() => setOrderType("Entrega")}
                >
                  Entrega
                </button>
                <button
                  type="button"
                  className={orderType === "Retirada" ? "active" : ""}
                  onClick={() => setOrderType("Retirada")}
                >
                  Retirada
                </button>
              </div>

              {orderType === "Entrega" ? <>
                <div className="delivery-fee-notice">
                  <span>Entrega por localização</span>
                  <strong>
                    {deliveryDistanceKm === null
                      ? "R$ 1,00/km"
                      : `${currency.format(deliveryFee)} · ${deliveryDistanceKm.toLocaleString("pt-BR")} km`}
                  </strong>
                  <small aria-live="polite">
                    {locationStatus === "locating" ? "Obtendo sua localização…" :
                      locationStatus === "calculating" ? "Calculando a rota até o Moca…" :
                        locationStatus === "ready" ? "Localização confirmada e rota calculada." :
                          locationStatus === "estimate" ? "Localização confirmada e distância estimada." :
                            locationStatus === "error" ? "Não foi possível calcular. Tente novamente." :
                              "Autorize sua localização para calcular a entrega automaticamente."}
                  </small>
                  <button
                    type="button"
                    onClick={requestDeliveryLocation}
                    disabled={locationStatus === "locating" || locationStatus === "calculating"}
                  >
                    {locationStatus === "locating" || locationStatus === "calculating"
                      ? "Calculando…"
                      : deliveryDistanceKm === null ? "Usar minha localização" : "Atualizar localização"}
                  </button>
                </div>
                <label>
                  <span>Endereço para entrega *</span>
                  <textarea
                    value={deliveryAddress}
                    onChange={(event) => setDeliveryAddress(event.target.value)}
                    placeholder="Rua, número, bairro e complemento"
                    rows={2}
                  />
                </label>
                <label>
                  <span>Ponto de referência *</span>
                  <input
                    value={referencePoint}
                    onChange={(event) => setReferencePoint(event.target.value)}
                    placeholder="Ex.: próximo à praça"
                  />
                </label>
              </> : (
                <p className="pickup-message">Retirada no endereço do Moca Restaurante.</p>
              )}
            </section>
          </> : (
            <div className="empty-cart">
              <BagIcon />
              <h3>Seu pedido está vazio</h3>
              <p>Adicione produtos do cardápio para montar seu pedido.</p>
              <button type="button" onClick={() => { setCartOpen(false); jumpToCategory("Destaques"); }}>Ver cardápio</button>
            </div>
          )}
        </div>

        {cart.length ? (
          <div className="drawer-footer">
            <label>
              <span>Observação geral</span>
              <textarea
                value={generalNote}
                onChange={(event) => setGeneralNote(event.target.value)}
                placeholder="Ex.: retirar no balcão às 20h"
                rows={2}
              />
            </label>
            <div className="totals"><span>Subtotal</span><strong>{currency.format(subtotal)}</strong></div>
            {orderType === "Entrega" ? (
              <div className="totals"><span>Taxa de entrega</span><strong>{currency.format(deliveryFee)}</strong></div>
            ) : null}
            <div className="totals total"><span>Total</span><strong>{currency.format(orderTotal)}</strong></div>
            <button
              className="whatsapp-button"
              type="button"
              onClick={finishOrder}
              disabled={submittingOrder}
            >
              {submittingOrder ? "Enviando pedido…" : "Enviar pedido ao Moca"} <ArrowIcon />
            </button>
            <small>O pedido será registrado e encaminhado para impressão. A equipe confirmará o atendimento.</small>
          </div>
        ) : null}
      </aside>

      {lastOrder ? (
        <div className="order-success-backdrop" role="presentation">
          <section className="order-success" role="dialog" aria-modal="true" aria-labelledby="pedido-recebido">
            <span>Pedido recebido</span>
            <h2 id="pedido-recebido">Pedido #{lastOrder.number}</h2>
            <p>O pedido foi registrado para impressão no Moca. Envie a confirmação pelo WhatsApp para acompanhar o atendimento.</p>
            <a href={lastOrder.whatsappUrl} target="_blank" rel="noreferrer">
              Confirmar pelo WhatsApp <ArrowIcon />
            </a>
            <button type="button" onClick={() => setLastOrder(null)}>Fechar</button>
          </section>
        </div>
      ) : null}

      <div className={`toast ${toast ? "is-visible" : ""}`} role="status">{toast}</div>
    </main>
  );
}
