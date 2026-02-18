export const STORAGE_KEY = "sokemi.catalog.v2";

export const DEFAULT_CATALOG = {
  version: 3,
  categories: [
    {
      id: "cat-food",
      name: "Корм",
      imageUrl: "../../images/02883cd920e3c0cd58c695fdfbe72102.png",
      products: [
        {
          id: "prod-food-1",
          name: "Fukunuba Top Condition с домашней птицей",
          description: "Сбалансированный сухой корм для взрослых кошек.",
          type: "Сухой корм",
          flavor: "Птица",
          age: "Для взрослых",
          price: 1843,
          weights: [1000, 400],
          images: [
            "../../images/02883cd920e3c0cd58c695fdfbe72102.png",
            "../../images/5a64ee2fc0a80bfcc41ab4890eb1ca12.jpg"
          ]
        },
        {
          id: "prod-food-2",
          name: "Royal Canin Sterilised 37",
          description: "Полноценное питание для стерилизованных кошек.",
          type: "Сухой корм",
          flavor: "Смешанный",
          age: "Для взрослых",
          price: 1990,
          weights: [400, 1500],
          images: ["../../images/44a0c5bf0c9e30ff0bf79a0d184529cd.jpg"]
        }
      ]
    },
    {
      id: "cat-care",
      name: "Уход",
      imageUrl: "../../images/b72c74f08c3e0085c9a9074f1b5a1f29.png",
      products: [
        {
          id: "prod-care-1",
          name: "Спрей для расчесывания",
          description: "Мягкий спрей для легкого ухода за шерстью.",
          type: "Спрей",
          flavor: "Без вкуса",
          age: "Для всех возрастов",
          price: 590,
          weights: [200],
          images: ["../../images/2de8c9e1e57e6d43e982767fddffdd62.jpg"]
        }
      ]
    },
    {
      id: "cat-other",
      name: "Другое",
      imageUrl: "../../images/defc504c9951b4ffe1c63f8acd032daa.png",
      products: [
        {
          id: "prod-other-1",
          name: "Лежанка",
          description: "Мягкая лежанка с бортиками для сна.",
          type: "Другое",
          flavor: "",
          age: "Для всех возрастов",
          price: 1890,
          weights: [1000],
          images: ["../../images/6bb2d6416478086488069231c055085a.jpg"]
        }
      ]
    }
  ]
};

function parseJson(raw) {
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const DISPLAY_TRANSLATIONS = {
  Food: "Корм",
  Care: "Уход",
  "Dry food": "Сухой корм",
  Poultry: "Птица",
  Mixed: "Смешанный",
  Adult: "Для взрослых",
  "All ages": "Для всех возрастов",
  None: "Без вкуса",
  "Fukunuba Top Condition Poultry": "Fukunuba Top Condition с домашней птицей",
  "Balanced dry food for adult cats.": "Сбалансированный сухой корм для взрослых кошек.",
  "Complete nutrition for sterilized cats.": "Полноценное питание для стерилизованных кошек.",
  "Detangling Spray": "Спрей для расчесывания",
  "Gentle spray for easy brushing.": "Мягкий спрей для легкого ухода за шерстью."
};

function translateDisplayText(value) {
  const text = String(value || "").trim();
  return DISPLAY_TRANSLATIONS[text] || text;
}

function normalizePrice(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? Math.round(numeric) : 0;
}

function normalizeWeightList(value) {
  const list = Array.isArray(value) ? value : [];
  const result = [];

  list.forEach((item) => {
    const numeric = Number(item);
    if (!Number.isFinite(numeric)) return;

    const grams = Math.round(numeric);
    if (grams <= 0) return;
    if (!result.includes(grams)) {
      result.push(grams);
    }
  });

  return result;
}

function normalizeImageList(value) {
  const list = Array.isArray(value) ? value : [];

  return list
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .filter((url, index, arr) => arr.indexOf(url) === index);
}

function normalizeProduct(source, fallbackId) {
  if (typeof source === "string") {
    return {
      id: fallbackId,
      name: source.trim() || "Товар без названия",
      description: "",
      type: "",
      flavor: "",
      age: "",
      price: 0,
      weights: [],
      images: []
    };
  }

  const record = source && typeof source === "object" ? source : {};

  return {
    id: String(record.id || fallbackId).trim(),
    name: translateDisplayText(String(record.name || "").trim()) || "Товар без названия",
    description: translateDisplayText(String(record.description || "").trim()),
    type: translateDisplayText(String(record.type || "").trim()),
    flavor: translateDisplayText(String(record.flavor || "").trim()),
    age: translateDisplayText(String(record.age || "").trim()),
    price: normalizePrice(record.price),
    weights: normalizeWeightList(record.weights),
    images: normalizeImageList(record.images)
  };
}

function normalizeCategory(source, index) {
  const record = source && typeof source === "object" ? source : {};
  const categoryId = String(record.id || `cat-${index + 1}`).trim();

  const products = Array.isArray(record.products) ? record.products : [];

  return {
    id: categoryId,
    name: translateDisplayText(String(record.name || "").trim()) || `Категория ${index + 1}`,
    imageUrl: String(record.imageUrl || "").trim(),
    products: products
      .map((product, productIndex) => normalizeProduct(product, `${categoryId}-prod-${productIndex + 1}`))
      .filter((product) => product.id)
  };
}

function normalizeCatalog(source) {
  if (!source || typeof source !== "object") {
    return { version: 3, categories: [] };
  }

  const categories = Array.isArray(source.categories) ? source.categories : [];

  return {
    version: 3,
    categories: categories
      .map((category, index) => normalizeCategory(category, index))
      .filter((category) => category.id && category.name)
  };
}

export function saveCatalog(catalog) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeCatalog(catalog)));
}

export function readCatalog() {
  return normalizeCatalog(parseJson(localStorage.getItem(STORAGE_KEY)));
}

export function initCatalogStorage() {
  const parsed = parseJson(localStorage.getItem(STORAGE_KEY));

  if (!parsed) {
    saveCatalog(DEFAULT_CATALOG);
    return readCatalog();
  }

  const normalized = normalizeCatalog(parsed);

  if (!normalized.categories.length) {
    saveCatalog(DEFAULT_CATALOG);
    return readCatalog();
  }

  saveCatalog(normalized);
  return normalized;
}
