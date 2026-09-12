export type MenuCategory =
  | "Destaques"
  | "Promoções"
  | "Combos"
  | "Sushi"
  | "Sashimi"
  | "Nigiri"
  | "Uramaki"
  | "Hossomaki"
  | "Hot Roll"
  | "Temaki"
  | "Joy"
  | "Porções"
  | "Entradas"
  | "Pratos"
  | "Sobremesas"
  | "Bebidas"
  | "Vinhos"
  | "Drinks";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  category: Exclude<MenuCategory, "Destaques" | "Promoções" | "Vinhos" | "Drinks">;
  subcategory?: string;
  price: number;
  priceLabel?: string;
  pieces?: number;
  volume?: string;
  image: string;
  imageAlt: string;
  featured?: boolean;
  available: boolean;
  badge?: string;
};

export const MOCA_IMAGE = "/moca-card.svg";

export const CATEGORY_FILTERS: MenuCategory[] = [
  "Destaques",
  "Promoções",
  "Combos",
  "Sushi",
  "Sashimi",
  "Nigiri",
  "Uramaki",
  "Hossomaki",
  "Hot Roll",
  "Temaki",
  "Joy",
  "Porções",
  "Entradas",
  "Pratos",
  "Sobremesas",
  "Bebidas",
  "Vinhos",
  "Drinks",
];

const WEB_PHOTOS = {
  wineWhite: [
    MOCA_IMAGE,
    MOCA_IMAGE,
    MOCA_IMAGE,
  ],
  wineRed: [
    MOCA_IMAGE,
    MOCA_IMAGE,
    MOCA_IMAGE,
  ],
  wineRose: MOCA_IMAGE,
  mojito: MOCA_IMAGE,
  aperol: MOCA_IMAGE,
  espressoMartini: MOCA_IMAGE,
  ginTonic: MOCA_IMAGE,
  margarita: MOCA_IMAGE,
  cosmopolitan: MOCA_IMAGE,
  pinaColada: MOCA_IMAGE,
  blueCocktail: MOCA_IMAGE,
  assortedCocktails: MOCA_IMAGE,
  negroni: MOCA_IMAGE,
  manhattan: MOCA_IMAGE,
  dryMartini: MOCA_IMAGE,
} as const;

const BEVERAGE_PHOTOS = {
  water: MOCA_IMAGE,
  soda: MOCA_IMAGE,
  sodaBottle: MOCA_IMAGE,
  juice: MOCA_IMAGE,
  coffee: MOCA_IMAGE,
} as const;

const temaki = (
  id: string,
  name: string,
  description: string,
  price: number,
  _image = MOCA_IMAGE,
  featured = false,
): MenuItem => ({
  id,
  name,
  description,
  category: "Temaki",
  price,
  image: _image || MOCA_IMAGE,
  imageAlt: "Moca",
  featured,
  available: true,
});

const drink = (
  id: string,
  name: string,
  subcategory: string,
  price: number,
  _image: string,
  description = subcategory,
  volume = "Volume não informado no cardápio",
  featured = false,
): MenuItem => ({
  id,
  name,
  description,
  category: "Bebidas",
  subcategory,
  price,
  volume,
  image: _image || MOCA_IMAGE,
  imageAlt: "Moca",
  featured,
  available: true,
});

const dish = (
  id: string,
  name: string,
  description: string,
  category: MenuItem["category"],
  price: number,
  pieces?: number,
  featured = false,
  badge?: string,
): MenuItem => ({
  id,
  name,
  description,
  category,
  price,
  pieces,
  image: MOCA_IMAGE,
  imageAlt: `Espaço reservado para a foto de ${name}`,
  featured,
  available: true,
  badge,
});

const consultDrink = (
  id: string,
  name: string,
  subcategory: string,
  _image: string,
  description: string,
  volume: string,
): MenuItem => ({
  ...drink(id, name, subcategory, 0, _image, description, volume),
  priceLabel: "Consultar",
});

export const MENU_ITEMS: MenuItem[] = [
  dish("combo-essencial", "Combo Essencial", "20 peças com hossomaki, uramaki, nigiri e hot roll.", "Combos", 64.9, 20, true, "Mais pedido"),
  dish("combo-casal", "Combo Casal", "32 peças para compartilhar: seleção de salmão, uramaki, nigiri e hot.", "Combos", 99.9, 32, true),
  dish("combo-moca", "Combo Moca", "50 peças com uma seleção completa da casa para até quatro pessoas.", "Combos", 159.9, 50, true, "Experiência Moca"),
  dish("combo-hot", "Combo Hot", "24 peças empanadas com salmão, cream cheese e finalização de tarê.", "Combos", 79.9, 24),
  dish("combo-vegetariano", "Combo Vegetariano", "20 peças com pepino, manga, avocado e legumes crocantes.", "Combos", 59.9, 20),

  dish("sushi-salmao", "Sushi de Salmão", "Arroz japonês e salmão fresco, finalizado com cebolinha.", "Sushi", 29.9, 6, true),
  dish("sushi-atum", "Sushi de Atum", "Arroz japonês e atum fresco em corte delicado.", "Sushi", 31.9, 6),
  dish("sushi-peixe-branco", "Sushi de Peixe Branco", "Peixe branco fresco com toque cítrico da casa.", "Sushi", 27.9, 6),
  dish("sushi-macaricado", "Sushi Maçaricado", "Salmão maçaricado, molho especial e crispy de alho-poró.", "Sushi", 34.9, 6, true),

  dish("sashimi-salmao-5", "Sashimi de Salmão", "Fatias de salmão fresco selecionado.", "Sashimi", 34.9, 5, true),
  dish("sashimi-atum-5", "Sashimi de Atum", "Fatias de atum fresco selecionado.", "Sashimi", 37.9, 5),
  dish("sashimi-peixe-branco-5", "Sashimi de Peixe Branco", "Corte fresco com limão-siciliano e cebolinha.", "Sashimi", 31.9, 5),
  dish("sashimi-misto-12", "Sashimi Misto", "Seleção de salmão, atum e peixe branco.", "Sashimi", 74.9, 12, true),

  dish("nigiri-salmao", "Nigiri Salmão", "Bolinho de arroz coberto com salmão fresco.", "Nigiri", 19.9, 4),
  dish("nigiri-atum", "Nigiri Atum", "Bolinho de arroz coberto com atum fresco.", "Nigiri", 21.9, 4),
  dish("nigiri-salmao-macaricado", "Nigiri Salmão Maçaricado", "Salmão maçaricado, tarê e gergelim.", "Nigiri", 23.9, 4, true),
  dish("nigiri-skin", "Nigiri Skin", "Pele de salmão crocante com tarê.", "Nigiri", 17.9, 4),

  dish("uramaki-salmao", "Uramaki Salmão", "Salmão fresco, cream cheese, cebolinha e gergelim.", "Uramaki", 29.9, 8, true),
  dish("uramaki-filadelfia", "Uramaki Filadélfia", "Salmão, cream cheese e cebolinha.", "Uramaki", 31.9, 8, true),
  dish("uramaki-california", "Uramaki Califórnia", "Kani, manga, pepino e gergelim.", "Uramaki", 25.9, 8),
  dish("uramaki-ebiten", "Uramaki Ebiten", "Camarão empanado, cream cheese e tarê.", "Uramaki", 34.9, 8),
  dish("uramaki-skin", "Uramaki Skin", "Skin crocante, cream cheese, cebolinha e tarê.", "Uramaki", 24.9, 8),
  dish("uramaki-macaricado", "Uramaki Maçaricado", "Salmão maçaricado, cream cheese e molho especial.", "Uramaki", 36.9, 8, true),

  dish("hossomaki-salmao", "Hossomaki Salmão", "Enrolado tradicional de salmão envolto em nori.", "Hossomaki", 23.9, 8, true),
  dish("hossomaki-atum", "Hossomaki Atum", "Enrolado tradicional de atum envolto em nori.", "Hossomaki", 25.9, 8),
  dish("hossomaki-kani", "Hossomaki Kani", "Enrolado tradicional de kani envolto em nori.", "Hossomaki", 20.9, 8),
  dish("hossomaki-kappa", "Kappamaki", "Enrolado vegetariano de pepino e gergelim.", "Hossomaki", 18.9, 8),
  dish("hossomaki-camarao", "Hossomaki Camarão", "Camarão temperado, arroz e nori.", "Hossomaki", 27.9, 8),
  dish("hossomaki-salmao-cream-cheese", "Hossomaki Salmão Cream Cheese", "Salmão, cream cheese e cebolinha.", "Hossomaki", 26.9, 8),

  dish("hot-filadelfia", "Hot Filadélfia", "Salmão e cream cheese empanados, com tarê.", "Hot Roll", 29.9, 8, true),
  dish("hot-camarao", "Hot Camarão", "Camarão, cream cheese e tarê em massa crocante.", "Hot Roll", 34.9, 8),
  dish("hot-skin", "Hot Skin", "Skin, cream cheese, cebolinha e tarê.", "Hot Roll", 25.9, 8),
  dish("hot-especial-moca", "Hot Especial Moca", "Salmão, camarão e cream cheese, finalizado com molho especial.", "Hot Roll", 39.9, 8, true),

  dish("joy-salmao", "Joy Salmão", "Arroz envolto em salmão com cream cheese e cebolinha.", "Joy", 29.9, 6),
  dish("joy-macaricado", "Joy Maçaricado", "Salmão maçaricado, cream cheese e crispy.", "Joy", 34.9, 6, true),
  dish("joy-camarao", "Joy Camarão", "Salmão, cream cheese e camarão crocante.", "Joy", 37.9, 6),

  dish("sunomono", "Sunomono", "Pepino agridoce, kani e gergelim.", "Entradas", 17.9, undefined, true),
  dish("guioza", "Guioza", "Pastéis japoneses dourados, acompanhados de molho da casa.", "Entradas", 24.9, 6),
  dish("harumaki-queijo", "Harumaki de Queijo", "Rolinho primavera de queijo, servido crocante.", "Entradas", 21.9, 4),
  dish("camarao-panko", "Camarão Panko", "Camarões empanados em panko com molho especial.", "Porções", 44.9, 8, true),
  dish("salmao-grelhado", "Salmão Grelhado", "Salmão grelhado com gohan e legumes.", "Pratos", 54.9, undefined, true),
  dish("yakisoba-misto", "Yakisoba Misto", "Macarrão, legumes, carne e frango ao molho oriental.", "Pratos", 39.9),
  dish("teppan-frango", "Teppan de Frango", "Frango grelhado, legumes salteados e gohan.", "Pratos", 36.9),

  temaki(
    "temaki-salmao",
    "Temaki Salmão Tradicional",
    "Salmão fresco em cubos. Acompanha arroz, nori, cream cheese, cebolinha e gergelim.",
    39,
    MOCA_IMAGE,
    true,
  ),
  temaki(
    "temaki-filadelfia",
    "Temaki Filadélfia",
    "Pasta de salmão grelhado com cream cheese. Acompanha arroz, nori, cebolinha e gergelim.",
    32,
  ),
  temaki(
    "temaki-california",
    "Temaki Califórnia",
    "Manga, pepino, kani e alface. Acompanha arroz, nori, cream cheese, cebolinha e gergelim.",
    29,
  ),
  temaki(
    "temaki-skin",
    "Temaki Skin",
    "Pele de salmão temperada e frita. Acompanha arroz, nori, cream cheese, cebolinha e gergelim.",
    24,
  ),
  temaki(
    "temaki-ebiten",
    "Temaki Ebiten",
    "Camarão temperado e empanado na panko. Acompanha arroz, nori, cream cheese, cebolinha e gergelim.",
    37,
    MOCA_IMAGE,
    true,
  ),
  temaki(
    "temaki-hot",
    "Temaki Hot",
    "Pasta de salmão empanado e frito na panko com cream cheese.",
    29,
    MOCA_IMAGE,
    true,
  ),
  temaki(
    "temaki-moca-especial",
    "Temaki Moca Especial",
    "Lâmina de salmão maçaricado, camarão furaí, cream cheese e furikake, finalizado com tarê.",
    69.99,
    MOCA_IMAGE,
    true,
  ),
  temaki(
    "monte-seu-temaki",
    "Monte o seu Temaki",
    "Escolha 2 combinações de recheio/proteína. Acompanha cream cheese, cebolinha e gergelim.",
    38,
  ),
  temaki(
    "adicional-panko",
    "Temaki empanado na panko",
    "Adicional para o temaki escolhido.",
    6,
    MOCA_IMAGE,
  ),

  {
    id: "macaron",
    name: "Macaron",
    description: "Sobremesa disponível no cardápio Moca.",
    category: "Sobremesas",
    price: 7,
    image: MOCA_IMAGE,
    imageAlt: "Moca",
    featured: true,
    available: true,
  },
  {
    id: "petit-gateau-branco",
    name: "Petit Gâteau Branco",
    description: "Bolinho de chocolate branco com calda de leite Ninho, acompanhado de sorvete.",
    category: "Sobremesas",
    price: 29.9,
    image: MOCA_IMAGE,
    imageAlt: "Moca",
    featured: true,
    available: true,
  },
  {
    id: "petit-gateau-chocolate",
    name: "Petit Gâteau de Chocolate",
    description: "Bolinho de chocolate ao leite com calda de Nutella, acompanhado de sorvete.",
    category: "Sobremesas",
    price: 29.9,
    image: MOCA_IMAGE,
    imageAlt: "Moca",
    available: true,
  },

  drink("agua-com-gas", "Água com gás", "Águas", 9, BEVERAGE_PHOTOS.water, "Água mineral com gás.", "Garrafa", true),
  drink("agua-sem-gas", "Água sem gás", "Águas", 9, BEVERAGE_PHOTOS.water, "Água mineral sem gás.", "Garrafa", true),
  drink("agua-coco-garrafa", "Água de coco", "Águas", 10, MOCA_IMAGE, "Água de coco servida na garrafa.", "Garrafa", true),

  drink("coca-cola", "Coca-Cola", "Refrigerantes", 9, BEVERAGE_PHOTOS.soda, "Coca-Cola tradicional.", "Embalagem conforme disponibilidade", true),
  drink("coca-cola-zero", "Coca-Cola Zero", "Refrigerantes", 9, BEVERAGE_PHOTOS.soda, "Coca-Cola sem açúcar.", "Embalagem conforme disponibilidade"),
  drink("coca-cola-ks", "Coca-Cola KS", "Refrigerantes", 9, BEVERAGE_PHOTOS.sodaBottle, "Coca-Cola tradicional em garrafa KS.", "Garrafa KS"),
  drink("coca-cola-ks-zero", "Coca-Cola KS Zero", "Refrigerantes", 9, BEVERAGE_PHOTOS.sodaBottle, "Coca-Cola sem açúcar em garrafa KS.", "Garrafa KS"),
  drink("fanta-laranja", "Fanta Laranja", "Refrigerantes", 9, MOCA_IMAGE, "Refrigerante sabor laranja.", "Embalagem conforme disponibilidade"),
  drink("fanta-uva", "Fanta Uva", "Refrigerantes", 9, MOCA_IMAGE, "Refrigerante sabor uva.", "Embalagem conforme disponibilidade"),
  drink("sprite", "Sprite", "Refrigerantes", 9, MOCA_IMAGE, "Refrigerante sabor limão.", "Embalagem conforme disponibilidade"),
  drink("sprite-zero", "Sprite Zero", "Refrigerantes", 9, MOCA_IMAGE, "Refrigerante sabor limão sem açúcar.", "Embalagem conforme disponibilidade"),
  drink("guarana", "Guaraná", "Refrigerantes", 9, MOCA_IMAGE, "Guaraná tradicional.", "Embalagem conforme disponibilidade"),
  drink("guarana-zero", "Guaraná Zero", "Refrigerantes", 9, MOCA_IMAGE, "Guaraná sem açúcar.", "Embalagem conforme disponibilidade"),

  drink("suco-limao", "Suco de limão", "Sucos", 14, BEVERAGE_PHOTOS.juice, "Suco de limão preparado na hora.", "Copo"),
  drink("suco-laranja", "Suco de laranja", "Sucos", 14, BEVERAGE_PHOTOS.juice, "Suco de laranja preparado na hora.", "Copo"),
  drink("suco-polpa", "Suco de polpa", "Sucos", 14, BEVERAGE_PHOTOS.juice, "Vários sabores disponíveis. Informe o sabor desejado na observação do item.", "Copo"),
  drink("suco-leite", "Suco ao leite", "Sucos", 17, BEVERAGE_PHOTOS.juice, "Suco preparado com leite.", "Copo"),

  consultDrink("cafe-coado-p", "Café coado — P", "Cafés", BEVERAGE_PHOTOS.coffee, "Café coado, tamanho pequeno.", "P"),
  consultDrink("cafe-coado-g", "Café coado — G", "Cafés", BEVERAGE_PHOTOS.coffee, "Café coado, tamanho grande.", "G"),
  consultDrink("cafe-carioca-p", "Café carioca — P", "Cafés", BEVERAGE_PHOTOS.coffee, "Café carioca, tamanho pequeno.", "P"),
  consultDrink("cafe-carioca-g", "Café carioca — G", "Cafés", BEVERAGE_PHOTOS.coffee, "Café carioca, tamanho grande.", "G"),
  consultDrink("cafe-expresso-p", "Café expresso — P", "Cafés", BEVERAGE_PHOTOS.coffee, "Café expresso, tamanho pequeno.", "P"),
  consultDrink("cafe-expresso-g", "Café expresso — G", "Cafés", BEVERAGE_PHOTOS.coffee, "Café expresso, tamanho grande.", "G"),
  consultDrink("cafe-descafeinado-p", "Café descafeinado — P", "Cafés", BEVERAGE_PHOTOS.coffee, "Café descafeinado, tamanho pequeno.", "P"),
  consultDrink("cafe-descafeinado-g", "Café descafeinado — G", "Cafés", BEVERAGE_PHOTOS.coffee, "Café descafeinado, tamanho grande.", "G"),

  drink("heineken", "Heineken", "Cervejas", 14, MOCA_IMAGE, "Cerveja.", "Volume não informado", true),
  drink("stella", "Stella", "Cervejas", 14, MOCA_IMAGE, "Cerveja."),
  drink("michel", "Michel", "Cervejas", 14, MOCA_IMAGE, "Cerveja."),
  drink("antarctica-original", "Antarctica Original", "Cervejas", 7.5, MOCA_IMAGE, "Cerveja."),

  drink("mojito", "Mojito", "Drinks", 22, WEB_PHOTOS.mojito, "Drink do cardápio Moca.", "Taça não informada"),
  drink("sex-on-the-beach", "Sex on the Beach", "Drinks", 25, WEB_PHOTOS.assortedCocktails),
  drink("aperol-spritz", "Aperol Spritz", "Drinks", 26, WEB_PHOTOS.aperol),
  drink("manhattan", "Manhattan", "Drinks", 20, WEB_PHOTOS.manhattan),
  drink("cosmopolitan", "Cosmopolitan", "Drinks", 25, WEB_PHOTOS.cosmopolitan),
  drink("espresso-martini", "Espresso Martini", "Drinks", 23, WEB_PHOTOS.espressoMartini),
  drink("negroni", "Negroni", "Drinks", 26, WEB_PHOTOS.negroni),
  drink("dry-martini", "Dry Martini", "Drinks", 23, WEB_PHOTOS.dryMartini),
  drink("pina-colada", "Piña Colada", "Drinks", 22, WEB_PHOTOS.pinaColada),
  drink("alexander", "Alexander", "Drinks", 22, WEB_PHOTOS.espressoMartini),
  drink("gin-tonica", "Gin Tônica", "Drinks", 22, WEB_PHOTOS.ginTonic),
  drink("margarita", "Margarita", "Drinks", 17, WEB_PHOTOS.margarita),
  drink("moscow-mule", "Moscow Mule", "Drinks", 28, WEB_PHOTOS.mojito),
  drink("carajillo", "Carajillo", "Drinks", 28, WEB_PHOTOS.espressoMartini),
  drink("fitzgerald", "Fitzgerald", "Drinks", 25, WEB_PHOTOS.ginTonic),
  drink("lagoa-azul", "Lagoa Azul", "Drinks", 20, WEB_PHOTOS.blueCocktail),
  drink("soda-italiana", "Soda Italiana", "Drinks", 18, WEB_PHOTOS.assortedCocktails),
  drink("caipiroska-n", "Caipiroska — N", "Drinks", 20, WEB_PHOTOS.assortedCocktails, "Opção nacional, conforme o cardápio manual."),
  drink("caipiroska-i", "Caipiroska — I", "Drinks", 25, WEB_PHOTOS.cosmopolitan, "Opção importada, conforme o cardápio manual."),
  drink("caipirinha", "Caipirinha", "Drinks", 18, WEB_PHOTOS.assortedCocktails),

  ...[
    ["faces-chile", "Faces do Chile Sauvignon Blanc", "Vinho branco", 105],
    ["indomita-polero-chardonnay", "Indomita Polero Chardonnay", "Vinho branco", 85],
    ["estancia-blend-branco", "Estancia Mendoza Blend", "Vinho branco", 95],
    ["belo-verdejo", "Belo Verdejo", "Vinho branco", 85],
    ["cartola-branco", "Cartola Branco", "Vinho branco", 95],
    ["alem-mar-branco", "Além Mar", "Vinho branco", 115],
    ["levorato-pinot-grigio", "Levorato Pinot Grigio", "Vinho branco", 129],
    ["adega-moncao", "Adega de Monção", "Vinho verde", 125],
    ["polero-rose", "Polero Rosé", "Vinho rosé", 85],
    ["don-guerino-merlot", "Don Guerino Sinais Merlot", "Vinho tinto", 125],
    ["viento-pinot-noir", "Viento del Mar Pinot Noir", "Vinho tinto", 85],
    ["bestia-carmenere", "Bestia Collection Carmenere", "Vinho tinto", 85],
    ["bestia-cabernet", "Bestia Cabernet Sauvignon", "Vinho tinto", 85],
    ["indomita-gran", "Indomita Gran", "Vinho tinto", 189],
    ["estancia-blend-tinto", "Estancia Mendoza Blend", "Vinho tinto", 95],
    ["septima-malbec", "Septima Emblema Malbec", "Vinho tinto", 129],
    ["belo-tempranillo", "Belo Tempranillo", "Vinho tinto", 85],
    ["alem-mar-tinto", "Além Mar", "Vinho tinto", 115],
    ["cartola-tinto", "Cartola", "Vinho tinto", 125],
    ["levorato-primitivo", "Levorato Primitivo", "Vinho tinto", 129],
    ["grandier-bordeaux", "Grandier Bordeaux", "Vinho tinto", 149],
  ].map(([id, name, subcategory, price], index) => {
    const wineImage =
      subcategory === "Vinho branco"
        ? WEB_PHOTOS.wineWhite[index % WEB_PHOTOS.wineWhite.length]
        : subcategory === "Vinho rosé"
          ? WEB_PHOTOS.wineRose
          : subcategory === "Vinho verde"
            ? WEB_PHOTOS.wineWhite[1]
            : WEB_PHOTOS.wineRed[(index - 9) % WEB_PHOTOS.wineRed.length];

    return drink(
      String(id),
      String(name),
      String(subcategory),
      Number(price),
      wineImage,
      String(subcategory),
      "Volume não informado",
    );
  }),

  ...[
    ["black-white-dose", "Black & White — dose", 12],
    ["black-white-garrafa", "Black & White — garrafa", 120],
    ["double-black-dose", "Double Black — dose", 24],
    ["double-black-garrafa", "Double Black — garrafa", 320],
    ["red-dose", "Red — dose", 15],
    ["red-garrafa", "Red — garrafa", 150],
    ["old-par-dose", "Old Parr — dose", 19],
    ["old-par-garrafa", "Old Parr — garrafa", 210],
    ["black-dose", "Black — dose", 20],
    ["black-garrafa", "Black — garrafa", 260],
    ["buchanan-dose", "Buchanan's — dose", 22],
    ["buchanan-garrafa", "Buchanan's — garrafa", 280],
    ["jack-daniels-dose", "Jack Daniel's — dose", 18],
    ["gold-label-dose", "Gold Label — dose", 30],
  ].map(([id, name, price]) =>
    drink(String(id), String(name), "Whiskys", Number(price), MOCA_IMAGE, "Whisky conforme o cardápio.", String(name).includes("garrafa") ? "Garrafa" : "Dose"),
  ),

  ...[
    ["campari", "Campari", 9],
    ["domencq", "Domencq", 9],
    ["aperol-dose", "Aperol", 11],
    ["cachaca-matuta", "Cachaça Matuta", 12],
    ["cachaca-preciosa", "Cachaça Preciosa", 10],
    ["rum-cristal", "Rum Cristal", 9],
    ["rum-havana", "Rum Havana", 15],
    ["gin-beefeater", "Gin Beefeater", 16],
    ["gin-bombay", "Gin Bombay", 20],
    ["gin-tanqueray", "Gin Tanqueray", 18],
    ["martini-rosato", "Martini Rosato", 9],
    ["martini-rosso", "Martini Rosso", 9],
    ["martini-bianco", "Martini Bianco", 9],
    ["vodka-absolut", "Vodka Absolut", 17],
    ["vodka-smirnoff", "Vodka Smirnoff", 10],
    ["licor-cointreau", "Licor Cointreau", 20],
    ["licor-baileys", "Licor Baileys", 20],
    ["licor-43", "Licor 43", 23],
    ["licor-amarula", "Licor Amarula", 23],
    ["tequila-cuervo", "Tequila Cuervo ouro/prata", 16],
  ].map(([id, name, price]) =>
    drink(String(id), String(name), "Doses", Number(price), MOCA_IMAGE, "Dose conforme o cardápio.", "Dose"),
  ),
];

export const BEVERAGE_FILTERS = [
  "Todas",
  "Refrigerantes",
  "Sucos",
  "Águas",
  "Cervejas",
  "Cafés",
  "Drinks",
  "Vinho branco",
  "Vinho verde",
  "Vinho rosé",
  "Vinho tinto",
  "Whiskys",
  "Doses",
];
