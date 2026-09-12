const menu = window.MOCA_MENU || [];
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const restaurant = { latitude: -7.1352309, longitude: -34.8281061 };
let category = "Todos";
let query = "";
let cart = [];
let orderType = "Entrega";
let deliveryDistanceKm = null;
let deliveryFee = 0;
const $ = (selector) => document.querySelector(selector);
const categories = ["Todos", ...new Set(menu.map((item) => item.category))];

$("#item-count").textContent = menu.length;

function toast(text) {
  const element = $("#toast");
  element.textContent = text;
  element.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => element.classList.remove("show"), 1800);
}

function renderCategories() {
  $("#categories").innerHTML = categories
    .map((name) => `<button class="${name === category ? "active" : ""}" data-category="${name}">${name}</button>`)
    .join("");
  document.querySelectorAll("[data-category]").forEach((button) => {
    button.onclick = () => {
      category = button.dataset.category;
      renderCategories();
      renderProducts();
    };
  });
}

function filtered() {
  const normalizedQuery = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return menu.filter((item) => (
    (category === "Todos" || item.category === category)
    && (!normalizedQuery || `${item.name} ${item.description} ${item.category}`
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(normalizedQuery))
  ));
}

function renderProducts() {
  const items = filtered();
  $("#visible-count").textContent = items.length;
  $("#empty").hidden = items.length > 0;
  $("#products").innerHTML = items.map((item) => `
    <article class="card">
      <div class="card-art"><span>moca<i>.</i></span><small>${item.category}</small></div>
      <div class="card-body">
        <h3>${item.name}</h3><p>${item.description}</p>
        <div class="card-meta"><strong>${money.format(item.price)}</strong><button data-add="${item.id}">Adicionar +</button></div>
      </div>
    </article>`).join("");
  document.querySelectorAll("[data-add]").forEach((button) => {
    button.onclick = () => add(button.dataset.add);
  });
}

function add(id) {
  const item = menu.find((entry) => entry.id === id);
  const found = cart.find((entry) => entry.id === id);
  if (found) found.qty += 1;
  else cart.push({ ...item, qty: 1 });
  renderCart();
  toast(`${item.name} adicionado`);
}

function change(id, delta) {
  const item = cart.find((entry) => entry.id === id);
  if (!item) return;
  item.qty += delta;
  cart = cart.filter((entry) => entry.qty > 0);
  renderCart();
}

function subtotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function totals() {
  const sub = subtotal();
  const fee = orderType === "Entrega" ? deliveryFee : 0;
  $("#subtotal").textContent = money.format(sub);
  $("#delivery-fee").textContent = money.format(fee);
  $("#total").textContent = money.format(sub + fee);
  $("#cart-summary").textContent = cart.length ? money.format(sub + fee) : "Carrinho vazio";
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  $("#header-count").textContent = count;
  $("#cart-count").textContent = count;
  $("#drawer-count").textContent = `${count} ${count === 1 ? "item" : "itens"}`;
  $("#cart-items").innerHTML = cart.length
    ? cart.map((item) => `<article class="cart-item"><div><p>${item.name}</p><small>${money.format(item.price * item.qty)}</small></div><div class="qty"><button data-minus="${item.id}">−</button><b>${item.qty}</b><button data-plus="${item.id}">+</button></div></article>`).join("")
    : "<p>Seu carrinho está vazio. Adicione itens do cardápio.</p>";
  document.querySelectorAll("[data-minus]").forEach((button) => { button.onclick = () => change(button.dataset.minus, -1); });
  document.querySelectorAll("[data-plus]").forEach((button) => { button.onclick = () => change(button.dataset.plus, 1); });
  totals();
}

function straightLineDistance(origin, destination) {
  const radians = (degrees) => degrees * Math.PI / 180;
  const latitudeDelta = radians(destination.latitude - origin.latitude);
  const longitudeDelta = radians(destination.longitude - origin.longitude);
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(radians(origin.latitude)) * Math.cos(radians(destination.latitude))
    * Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function calculateLocation(position) {
  const destination = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
  $("#location-status").textContent = "Calculando a rota até o Moca…";
  try {
    const coordinates = `${restaurant.longitude},${restaurant.latitude};${destination.longitude},${destination.latitude}`;
    const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=false&steps=false`);
    if (!response.ok) throw new Error("Rota indisponível");
    const data = await response.json();
    const distanceMeters = Number(data.routes?.[0]?.distance);
    if (!Number.isFinite(distanceMeters)) throw new Error("Rota não encontrada");
    deliveryDistanceKm = Math.round(distanceMeters / 100) / 10;
    $("#location-status").textContent = "Localização confirmada e rota calculada.";
  } catch {
    deliveryDistanceKm = Math.round(straightLineDistance(restaurant, destination) * 10) / 10;
    $("#location-status").textContent = "Localização confirmada e distância estimada.";
  }
  deliveryFee = deliveryDistanceKm;
  $("#location-value").textContent = `${money.format(deliveryFee)} · ${deliveryDistanceKm.toLocaleString("pt-BR")} km`;
  $("#use-location").textContent = "Atualizar localização";
  $("#use-location").disabled = false;
  totals();
  toast("Entrega calculada automaticamente");
}

function requestLocation() {
  if (!navigator.geolocation) return toast("Este navegador não permite obter sua localização");
  $("#use-location").disabled = true;
  $("#use-location").textContent = "Calculando…";
  $("#location-status").textContent = "Obtendo sua localização…";
  navigator.geolocation.getCurrentPosition(
    calculateLocation,
    () => {
      $("#use-location").disabled = false;
      $("#use-location").textContent = "Tentar novamente";
      $("#location-status").textContent = "Permita o acesso à localização para calcular a entrega.";
      toast("Não foi possível obter sua localização");
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
  );
}

function openCart() {
  if (!cart.length) return toast("Adicione um item ao pedido");
  $("#cart").classList.add("open");
  $("#cart").setAttribute("aria-hidden", "false");
  $("#backdrop").hidden = false;
}

function closeCart() {
  $("#cart").classList.remove("open");
  $("#cart").setAttribute("aria-hidden", "true");
  $("#backdrop").hidden = true;
}

$("#search").oninput = (event) => { query = event.target.value; renderProducts(); };
$("#clear-search").onclick = () => { $("#search").value = ""; query = ""; renderProducts(); };
$("#open-cart").onclick = openCart;
$("#floating-cart").onclick = openCart;
$("#close-cart").onclick = closeCart;
$("#backdrop").onclick = closeCart;
$("#use-location").onclick = requestLocation;
document.querySelectorAll("[data-type]").forEach((button) => {
  button.onclick = () => {
    orderType = button.dataset.type;
    document.querySelectorAll("[data-type]").forEach((entry) => entry.classList.toggle("active", entry === button));
    $("#delivery-fields").hidden = orderType === "Retirada";
    $("#delivery-line").hidden = orderType === "Retirada";
    $("#address").required = orderType === "Entrega";
    totals();
  };
});
$("#checkout").onsubmit = (event) => {
  event.preventDefault();
  if (!cart.length) return;
  if (orderType === "Entrega" && deliveryDistanceKm === null) return toast("Use sua localização para calcular a entrega");
  closeCart();
  $("#success").showModal();
  cart = [];
  deliveryDistanceKm = null;
  deliveryFee = 0;
  $("#location-value").textContent = "R$ 1,00/km";
  $("#location-status").textContent = "Autorize sua localização para calcular a entrega automaticamente.";
  $("#use-location").textContent = "Usar minha localização";
  renderCart();
  event.target.reset();
};
$("#close-success").onclick = () => $("#success").close();

renderCategories();
renderProducts();
renderCart();
