const accentMap = new Map(Object.entries({
  á: "a", à: "a", â: "a", ã: "a", ä: "a", Á: "A", À: "A", Â: "A", Ã: "A",
  é: "e", è: "e", ê: "e", ë: "e", É: "E", È: "E", Ê: "E",
  í: "i", ì: "i", î: "i", ï: "i", Í: "I", Ì: "I", Î: "I",
  ó: "o", ò: "o", ô: "o", õ: "o", ö: "o", Ó: "O", Ò: "O", Ô: "O", Õ: "O",
  ú: "u", ù: "u", û: "u", ü: "u", Ú: "U", Ù: "U", Û: "U",
  ç: "c", Ç: "C", ñ: "n", Ñ: "N", "—": "-", "–": "-", "…": "...",
}));

const ascii = (value) => Array.from(String(value ?? ""), (char) => accentMap.get(char) ?? char)
  .join("")
  .replace(/[^\x20-\x7E\n]/g, "?");

const money = (cents) => `R$ ${(Number(cents) / 100).toFixed(2).replace(".", ",")}`;

function wrap(text, width) {
  const words = ascii(text).trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    if (!line) {
      line = word.slice(0, width);
    } else if (`${line} ${word}`.length <= width) {
      line += ` ${word}`;
    } else {
      lines.push(line);
      line = word.slice(0, width);
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function columns(left, right, width) {
  const cleanLeft = ascii(left);
  const cleanRight = ascii(right);
  const available = Math.max(1, width - cleanRight.length - 1);
  return `${cleanLeft.slice(0, available).padEnd(available)} ${cleanRight}`;
}

export function renderPlainTicket(order, width = 48) {
  const divider = "-".repeat(width);
  const strongDivider = "=".repeat(width);
  const lines = [
    strongDivider,
    "NOVO PEDIDO - MOCA SUSHI".padStart(Math.floor((width + 24) / 2)).padEnd(width),
    `PEDIDO #${order.orderNumber}`.padStart(Math.floor((width + String(order.orderNumber).length + 8) / 2)).padEnd(width),
    strongDivider,
    `DATA: ${new Date(order.createdAt).toLocaleString("pt-BR")}`,
    `TIPO: ${ascii(order.orderType).toUpperCase()}`,
    `CLIENTE: ${ascii(order.customerName)}`,
    `TELEFONE: ${ascii(order.customerPhone)}`,
    `PAGAMENTO: ${ascii(order.paymentMethod).toUpperCase()}`,
  ];

  if (order.customerTaxId) lines.push(`CPF/CNPJ: ${ascii(order.customerTaxId)}`);
  if (order.orderType === "Entrega") {
    if (order.deliveryDistanceKm) lines.push(`DISTANCIA: ${order.deliveryDistanceKm} km`);
    lines.push(divider, "ENDERECO:", ...wrap(order.deliveryAddress, width));
    if (order.referencePoint) lines.push("REFERENCIA:", ...wrap(order.referencePoint, width));
  }

  lines.push(strongDivider, "ITENS");
  for (const item of order.items) {
    lines.push(columns(`${item.quantity}x ${item.name}`, money(item.totalCents), width));
    if (item.note) lines.push(...wrap(`  OBS: ${item.note}`, width));
  }

  lines.push(
    divider,
    columns("SUBTOTAL", money(order.subtotalCents), width),
  );
  if (order.deliveryFeeCents) lines.push(columns("ENTREGA", money(order.deliveryFeeCents), width));
  lines.push(columns("TOTAL", money(order.totalCents), width));

  if (order.generalNote) {
    lines.push(strongDivider, "OBSERVACAO GERAL:", ...wrap(order.generalNote, width));
  }

  lines.push(strongDivider, "PEDIDO NAO FISCAL", "AGUARDANDO CONFIRMACAO DA EQUIPE", "", "");
  return lines.map((line) => ascii(line).slice(0, width)).join("\n");
}

export function renderEscPos(order, width = 48) {
  const text = renderPlainTicket(order, width);
  return Buffer.concat([
    Buffer.from([0x1b, 0x40]),
    Buffer.from([0x1b, 0x61, 0x00]),
    Buffer.from(text, "ascii"),
    Buffer.from("\n\n", "ascii"),
    Buffer.from([0x1d, 0x56, 0x00]),
  ]);
}
