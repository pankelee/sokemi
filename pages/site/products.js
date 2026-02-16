const STORAGE_KEY = "sokemi.catalog.v2";
const PLACEHOLDER_IMAGE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><rect width='100%' height='100%' fill='%23e5e2d3'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-family='Arial' font-size='20'>No Image</text></svg>";

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("productsGrid");
  const emptyState = document.getElementById("productsEmpty");

  if (!grid || !emptyState) return;

  const catalog = readCatalog();
  const products = flattenProducts(catalog);

  if (!products.length) {
    emptyState.classList.add("is-visible");
    return;
  }

  const fragment = document.createDocumentFragment();
  products.forEach((product) => fragment.appendChild(createProductCard(product)));
  grid.appendChild(fragment);
});

function readCatalog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { categories: [] };

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { categories: [] };

    const categories = Array.isArray(parsed.categories) ? parsed.categories : [];
    return { categories };
  } catch {
    return { categories: [] };
  }
}

function flattenProducts(catalog) {
  const categories = Array.isArray(catalog.categories) ? catalog.categories : [];
  const products = [];

  categories.forEach((category) => {
    const categoryName = String(category.name || "").trim();
    const categoryImage = String(category.imageUrl || "").trim();
    const items = Array.isArray(category.products) ? category.products : [];

    items.forEach((product) => {
      products.push({
        ...product,
        categoryName,
        categoryImage
      });
    });
  });

  return products;
}

function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";

  const image = document.createElement("img");
  image.src = pickImage(product);
  image.alt = String(product.name || "").trim() || "Product";

  const title = document.createElement("h4");
  title.textContent = String(product.name || "Без названия").trim();

  card.appendChild(image);
  card.appendChild(title);

  if (product.categoryName) {
    const meta = document.createElement("p");
    meta.className = "product-meta";
    meta.textContent = `Категория: ${product.categoryName}`;
    card.appendChild(meta);
  }

  if (product.description) {
    const description = document.createElement("p");
    description.className = "product-description";
    description.textContent = String(product.description || "").trim();
    card.appendChild(description);
  }

  const price = document.createElement("p");
  price.className = "price";
  price.textContent = formatPrice(product.price);
  card.appendChild(price);

  return card;
}

function pickImage(product) {
  if (product && Array.isArray(product.images) && product.images.length > 0) {
    return String(product.images[0] || "").trim() || PLACEHOLDER_IMAGE;
  }

  if (product && product.categoryImage) {
    return String(product.categoryImage).trim() || PLACEHOLDER_IMAGE;
  }

  return PLACEHOLDER_IMAGE;
}

function formatPrice(value) {
  const numeric = Number(value);
  const safe = Number.isFinite(numeric) ? numeric : 0;

  return `${new Intl.NumberFormat("ru-RU").format(safe)} ₽`;
}
