import { mkdir, writeFile } from "node:fs/promises";
import { MENU_ITEMS } from "../app/data/menu";

await mkdir("dist", { recursive: true });
const publicItems = MENU_ITEMS.filter((item) => item.available && item.price > 0).map((item) => ({
  id: item.id,
  name: item.name,
  description: item.description,
  category: item.subcategory?.startsWith("Vinho") ? "Vinhos" : item.subcategory === "Drinks" ? "Drinks" : item.category,
  price: item.price,
  pieces: item.pieces ?? null,
  badge: item.badge ?? null,
}));
await writeFile("dist/menu.js", `window.MOCA_MENU=${JSON.stringify(publicItems)};\n`, "utf8");
console.log(`Demonstração exportada com ${publicItems.length} itens.`);
