import { initCatalogStorage, saveCatalog } from "./catalog-defaults.js";

const TEXT = {
  noImage: "Изображение не выбрано",
  imageSelected: "Изображение выбрано",
  imageLoadError: "Не удалось загрузить изображение",
  imageReadError: "Не удалось прочитать выбранный файл",
  noPhoto: "Без фото",
  addProduct: "+ Добавить товар",
  noProducts: "Товаров пока нет",
  editCategoryTitle: "Редактировать категорию",
  addCategoryTitle: "Добавить категорию",
  editProductTitle: "Редактировать товар",
  addProductTitle: "Добавить товар",
  noWeights: "Вес пока не добавлен",
  noProductImages: "Изображения пока не добавлены"
};

const ICONS = {
  pen: "../../images/pen.svg",
  trash: "../../images/trash.svg",
  arrow: "../../images/arrow.svg"
};

let catalog = initCatalogStorage();
let expandedCategoryIds = new Set(catalog.categories.map((category) => category.id));

const categoryList = document.getElementById("categoryList");
const addCategoryButton = document.querySelector(".add-category-btn");
const ordersList = document.getElementById("ordersList");
const contentTitle = document.getElementById("contentTitle");
const tabLinks = Array.from(document.querySelectorAll(".menu a[data-tab]"));
const tabCatalog = document.getElementById("tab-catalog");
const tabOrders = document.getElementById("tab-orders");

const modals = {
  delete: document.getElementById("deleteModal"),
  category: document.getElementById("categoryModal"),
  product: document.getElementById("productModal"),
  addWeight: document.getElementById("addWeightModal")
};

const deleteMessage = document.getElementById("deleteMessage");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

const categoryModalTitle = document.getElementById("categoryModalTitle");
const categoryForm = document.getElementById("categoryForm");
const categoryNameInput = document.getElementById("categoryNameInput");
const categoryImageUploadBtn = document.getElementById("categoryImageUploadBtn");
const categoryImageClearBtn = document.getElementById("categoryImageClearBtn");
const categoryImagePreview = document.getElementById("categoryImagePreview");
const categoryImageFileInput = document.getElementById("categoryImageFileInput");

const productModalTitle = document.getElementById("productModalTitle");
const productForm = document.getElementById("productForm");
const productNameInput = document.getElementById("productNameInput");
const productDescriptionInput = document.getElementById("productDescriptionInput");
const productTypeInput = document.getElementById("productTypeInput");
const productFlavorInput = document.getElementById("productFlavorInput");
const productAgeInput = document.getElementById("productAgeInput");
const productPriceInput = document.getElementById("productPriceInput");
const productWeightsList = document.getElementById("productWeightsList");
const productImagesList = document.getElementById("productImagesList");
const openAddWeightBtn = document.getElementById("openAddWeightBtn");
const productImageUploadBtn = document.getElementById("productImageUploadBtn");
const productImageFileInput = document.getElementById("productImageFileInput");

const addWeightForm = document.getElementById("addWeightForm");
const addWeightInput = document.getElementById("addWeightInput");

let deleteState = null;
let categoryEditorState = null;
let productEditorState = null;

const ORDER_STATUSES = ["Обработка", "В пути", "Доставлено"];
const ORDERS_KEY = "sokemi.orders";

function createId(prefix) {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizePrice(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? Math.round(numeric) : 0;
}

function normalizeWeight(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;

  const grams = Math.round(numeric);
  return grams > 0 ? grams : null;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function openModal(modal) {
  if (!modal) return;
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
}

function saveAndRender(nextCatalog) {
  catalog = nextCatalog;
  saveCatalog(catalog);
  renderCatalog();
}

function findCategory(categoryId) {
  return catalog.categories.find((category) => category.id === categoryId) || null;
}

function findProduct(categoryId, productId) {
  const category = findCategory(categoryId);
  if (!category) return { category: null, product: null };

  return {
    category,
    product: category.products.find((item) => item.id === productId) || null
  };
}

function withUpdatedCategory(categoryId, updater) {
  return {
    ...catalog,
    categories: catalog.categories.map((category) => (category.id === categoryId ? updater(category) : category))
  };
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error(TEXT.imageReadError));
    reader.readAsDataURL(file);
  });
}

function resetFormsAndPreviews() {
  categoryForm.reset();
  productForm.reset();
  addWeightForm.reset();

  categoryImageFileInput.value = "";
  productImageFileInput.value = "";

  categoryImagePreview.textContent = TEXT.noImage;
  productWeightsList.innerHTML = "";
  productImagesList.innerHTML = "";
}

function closeAllModals() {
  Object.values(modals).forEach(closeModal);

  deleteState = null;
  categoryEditorState = null;
  productEditorState = null;

  resetFormsAndPreviews();
}

function renderProductListItem(categoryId, product) {
  return `
    <li class="product-item">
      <span class="product-name">${escapeHtml(product.name)}</span>
      <div class="product-actions">
        <button class="icon-btn" type="button" data-action="open-product-editor" data-category-id="${categoryId}" data-product-id="${product.id}" aria-label="Открыть редактор товара">
          <img src="${ICONS.pen}" alt="" aria-hidden="true">
        </button>
        <button class="icon-btn delete" type="button" data-action="delete-product" data-category-id="${categoryId}" data-product-id="${product.id}" aria-label="Удалить товар">
          <img src="${ICONS.trash}" alt="" aria-hidden="true">
        </button>
      </div>
    </li>
  `;
}

function renderCategory(category) {
  const isOpen = expandedCategoryIds.has(category.id);
  const imageHtml = category.imageUrl
    ? `<img class="category-image" src="${escapeHtml(category.imageUrl)}" alt="${escapeHtml(category.name)}">`
    : `<span class="category-image category-image-empty">${TEXT.noPhoto}</span>`;

  const productsHtml = category.products.map((product) => renderProductListItem(category.id, product)).join("");

  return `
    <details class="category ${isOpen ? "is-open" : ""}" data-category-id="${category.id}" ${isOpen ? "open" : ""}>
      <summary>
        <span class="category-head-left">
          ${imageHtml}
          <span>${escapeHtml(category.name)}</span>
        </span>
        <span class="category-head-right">
          <button class="icon-btn" type="button" data-action="edit-category" data-category-id="${category.id}" aria-label="Редактировать категорию">
            <img src="${ICONS.pen}" alt="" aria-hidden="true">
          </button>
          <button class="icon-btn delete" type="button" data-action="delete-category" data-category-id="${category.id}" aria-label="Удалить категорию">
            <img src="${ICONS.trash}" alt="" aria-hidden="true">
          </button>
          <span class="category-arrow" aria-hidden="true">
            <img src="${ICONS.arrow}" alt="" aria-hidden="true">
          </span>
        </span>
      </summary>
      <div class="category-body-wrap">
        <div class="category-body">
          <button type="button" class="add-product" data-action="add-product" data-category-id="${category.id}">${TEXT.addProduct}</button>
          <ol class="product-list">${productsHtml || `<li class="product-item"><span class="empty-note">${TEXT.noProducts}</span></li>`}</ol>
        </div>
      </div>
    </details>
  `;
}

function renderCatalog() {
  categoryList.innerHTML = catalog.categories.map(renderCategory).join("");
  bindAccordions();
}

function readOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function updateOrderById(orderId, updater) {
  const orders = readOrders();
  const next = orders.map((order) => (order.id === orderId ? updater(order) : order));
  saveOrders(next);
  renderOrders();
}

function normalizeOrderItems(items) {
  const safeItems = Array.isArray(items) ? items : [];
  return safeItems.map((item) => ({
    id: String(item?.id || ""),
    name: String(item?.name || "Товар"),
    quantity: Math.max(1, Number(item?.quantity) || 1),
    price: Math.max(0, Number(item?.price) || 0),
    image: String(item?.image || "")
  }));
}

function calcOrderTotal(items) {
  return normalizeOrderItems(items).reduce((sum, item) => sum + item.quantity * item.price, 0);
}

function renderOrders() {
  if (!ordersList) return;

  const orders = readOrders();
  if (!orders.length) {
    ordersList.innerHTML = "<p>Заказов пока нет</p>";
    return;
  }

  ordersList.innerHTML = orders
    .map((order) => {
      const itemsCount = Array.isArray(order.items)
        ? order.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
        : 0;
      const total = Number(order.total) || 0;
      const status = order.status || "Обработка";
      const customer = order.customer || {};
      const items = Array.isArray(order.items) ? order.items : [];
      const options = ORDER_STATUSES.map(
        (value) => `<option value="${value}" ${value === status ? "selected" : ""}>${value}</option>`
      ).join("");

      return `
        <div class="order-row">
          <div>
            <h4>Заказ №${order.id}</h4>
            <p>Клиент: ${escapeHtml(customer.name || "Не указан")}</p>
            <p>Телефон: ${escapeHtml(customer.phone || "Не указан")}</p>
            <p>Товаров: ${itemsCount} • Сумма: ${new Intl.NumberFormat("ru-RU").format(total)} ₽</p>
            <div class="order-items-edit" data-order-id="${order.id}">
              ${items
                .map(
                  (item, index) => `
                  <div class="order-item-edit" data-item-index="${index}">
                    <input type="text" class="order-item-name" value="${escapeHtml(item.name || "Товар")}">
                    <input type="number" class="order-item-qty" min="1" value="${Number(item.quantity) || 1}">
                    <input type="number" class="order-item-price" min="0" value="${Number(item.price) || 0}">
                    <button type="button" class="btn btn-danger order-item-remove">Удалить</button>
                  </div>
                `
                )
                .join("")}
              <button type="button" class="btn order-item-add">+ Добавить товар</button>
            </div>
          </div>
          <div>
            <label for="status-${order.id}">Статус</label>
            <select class="order-status-select" id="status-${order.id}" data-order-id="${order.id}">
              ${options}
            </select>
          </div>
        </div>
      `;
    })
    .join("");
}

function switchTab(target) {
  const isOrders = target === "orders";
  tabCatalog?.classList.toggle("hidden", isOrders);
  tabOrders?.classList.toggle("hidden", !isOrders);
  if (contentTitle) {
    contentTitle.textContent = isOrders ? "Заказы" : "Каталог";
  }
  if (isOrders) {
    renderOrders();
  }
}

function initTabs() {
  if (!tabLinks.length) return;
  tabLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const target = link.getAttribute("data-tab");
      if (!target) return;
      tabLinks.forEach((item) => item.classList.remove("active"));
      link.classList.add("active");
      switchTab(target);
    });
  });
}

function bindAccordions() {
  Array.from(document.querySelectorAll("details.category")).forEach((details) => {
    const summary = details.querySelector("summary");
    const wrap = details.querySelector(".category-body-wrap");
    if (!summary || !wrap) return;

    wrap.style.height = details.open ? "auto" : "0px";
    details.classList.toggle("is-open", details.open);

    summary.addEventListener("click", (event) => {
      if (event.target instanceof HTMLElement && event.target.closest("button")) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      const categoryId = details.dataset.categoryId || "";
      const isOpen = details.classList.contains("is-open");

      if (isOpen) {
        wrap.style.height = `${wrap.scrollHeight}px`;
        void wrap.offsetHeight;

        details.classList.remove("is-open");
        wrap.style.height = "0px";
        expandedCategoryIds.delete(categoryId);

        const onEnd = () => {
          details.open = false;
          wrap.removeEventListener("transitionend", onEnd);
        };

        wrap.addEventListener("transitionend", onEnd);
        return;
      }

      details.open = true;
      details.classList.add("is-open");
      wrap.style.height = "0px";
      void wrap.offsetHeight;
      wrap.style.height = `${wrap.scrollHeight}px`;
      expandedCategoryIds.add(categoryId);

      const onEnd = () => {
        wrap.style.height = "auto";
        wrap.removeEventListener("transitionend", onEnd);
      };

      wrap.addEventListener("transitionend", onEnd);
    });
  });
}

function openCategoryEditor(mode, categoryId) {
  if (mode === "edit") {
    const category = findCategory(categoryId);
    if (!category) return;

    categoryEditorState = { mode, categoryId, imageUrl: normalizeText(category.imageUrl) };
    categoryModalTitle.textContent = TEXT.editCategoryTitle;
    categoryNameInput.value = category.name;
    categoryImagePreview.textContent = categoryEditorState.imageUrl ? TEXT.imageSelected : TEXT.noImage;
  } else {
    categoryEditorState = { mode: "create", categoryId: null, imageUrl: "" };
    categoryModalTitle.textContent = TEXT.addCategoryTitle;
    categoryNameInput.value = "";
    categoryImagePreview.textContent = TEXT.noImage;
  }

  openModal(modals.category);
  categoryNameInput.focus();
}

function renderProductEditorDraft() {
  if (!productEditorState) return;

  const { weights, images } = productEditorState.draft;

  productWeightsList.innerHTML = weights.length
    ? weights
        .map(
          (weight) => `
            <span class="chip">
              <span>${weight} г</span>
              <button class="chip-remove" type="button" data-weight="${weight}" aria-label="Удалить вес">x</button>
            </span>
          `
        )
        .join("")
    : `<span class="empty-note">${TEXT.noWeights}</span>`;

  productImagesList.innerHTML = images.length
    ? images
        .map(
          (image, index) => `
            <div class="image-tile">
              <img src="${escapeHtml(image)}" alt="Изображение товара ${index + 1}">
              <button class="image-remove" type="button" data-index="${index}" aria-label="Удалить изображение">x</button>
            </div>
          `
        )
        .join("")
    : `<span class="empty-note">${TEXT.noProductImages}</span>`;
}

function openProductEditor(mode, categoryId, productId) {
  if (mode === "edit") {
    const { product } = findProduct(categoryId, productId);
    if (!product) return;

    productEditorState = {
      mode,
      categoryId,
      productId,
      draft: {
        ...product,
        weights: Array.isArray(product.weights) ? [...product.weights] : [],
        images: Array.isArray(product.images) ? [...product.images] : []
      }
    };

    productModalTitle.textContent = TEXT.editProductTitle;
  } else {
    const id = createId("prod");

    productEditorState = {
      mode: "create",
      categoryId,
      productId: id,
      draft: {
        id,
        name: "",
        description: "",
        type: "",
        flavor: "",
        age: "",
        price: 0,
        weights: [],
        images: []
      }
    };

    productModalTitle.textContent = TEXT.addProductTitle;
  }

  const { draft } = productEditorState;
  productNameInput.value = draft.name;
  productDescriptionInput.value = draft.description;
  productTypeInput.value = draft.type;
  productFlavorInput.value = draft.flavor;
  productAgeInput.value = draft.age;
  productPriceInput.value = String(normalizePrice(draft.price));

  renderProductEditorDraft();
  openModal(modals.product);
  productNameInput.focus();
}

function openDeleteModal(state, message) {
  deleteState = state;
  deleteMessage.textContent = message;
  openModal(modals.delete);
}

addCategoryButton.addEventListener("click", () => {
  openCategoryEditor("create", null);
});

categoryList.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const actionButton = target.closest("[data-action]");
  if (!(actionButton instanceof HTMLElement)) return;

  const action = actionButton.dataset.action || "";
  const categoryId = actionButton.dataset.categoryId || "";
  const productId = actionButton.dataset.productId || "";

  if (action === "edit-category") return void openCategoryEditor("edit", categoryId);
  if (action === "add-product") return void openProductEditor("create", categoryId, null);
  if (action === "open-product-editor") return void openProductEditor("edit", categoryId, productId);

  if (action === "delete-category") {
    const category = findCategory(categoryId);
    if (!category) return;

    openDeleteModal({ type: "category", categoryId }, `Удалить категорию "${category.name}" вместе со всеми товарами?`);
    return;
  }

  if (action === "delete-product") {
    const { product } = findProduct(categoryId, productId);
    if (!product) return;

    openDeleteModal({ type: "product", categoryId, productId }, `Удалить товар "${product.name}"?`);
  }
});

categoryImageUploadBtn.addEventListener("click", () => categoryImageFileInput.click());

categoryImageFileInput.addEventListener("change", async () => {
  if (!categoryEditorState) return;

  const file = categoryImageFileInput.files?.[0];
  if (!file) return;

  try {
    categoryEditorState.imageUrl = await readFileAsDataUrl(file);
    categoryImagePreview.textContent = TEXT.imageSelected;
  } catch {
    categoryImagePreview.textContent = TEXT.imageLoadError;
  }

  categoryImageFileInput.value = "";
});

categoryImageClearBtn.addEventListener("click", () => {
  if (!categoryEditorState) return;

  categoryEditorState.imageUrl = "";
  categoryImagePreview.textContent = TEXT.noImage;
});

categoryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!categoryEditorState) return;

  const name = normalizeText(categoryNameInput.value);
  if (!name) return;

  if (categoryEditorState.mode === "create") {
    const categoryId = createId("cat");
    expandedCategoryIds.add(categoryId);

    saveAndRender({
      ...catalog,
      categories: [...catalog.categories, { id: categoryId, name, imageUrl: categoryEditorState.imageUrl, products: [] }]
    });
  } else {
    saveAndRender(
      withUpdatedCategory(categoryEditorState.categoryId, (category) => ({
        ...category,
        name,
        imageUrl: categoryEditorState.imageUrl
      }))
    );
  }

  closeAllModals();
});

openAddWeightBtn.addEventListener("click", () => {
  if (!productEditorState) return;

  addWeightInput.value = "";
  openModal(modals.addWeight);
  addWeightInput.focus();
});

addWeightForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!productEditorState) return;

  const grams = normalizeWeight(addWeightInput.value);
  if (grams === null) return;

  if (!productEditorState.draft.weights.includes(grams)) {
    productEditorState.draft.weights.push(grams);
    productEditorState.draft.weights.sort((a, b) => b - a);
  }

  closeModal(modals.addWeight);
  addWeightForm.reset();
  renderProductEditorDraft();
});

productWeightsList.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement) || !productEditorState) return;

  const button = target.closest(".chip-remove");
  if (!(button instanceof HTMLElement)) return;

  const weight = normalizeWeight(button.dataset.weight || "");
  if (weight === null) return;

  productEditorState.draft.weights = productEditorState.draft.weights.filter((item) => item !== weight);
  renderProductEditorDraft();
});

productImageUploadBtn.addEventListener("click", () => {
  if (productEditorState) {
    productImageFileInput.click();
  }
});

productImageFileInput.addEventListener("change", async () => {
  if (!productEditorState) return;

  const file = productImageFileInput.files?.[0];
  if (!file) return;

  try {
    productEditorState.draft.images.push(await readFileAsDataUrl(file));
    renderProductEditorDraft();
  } catch {
    // intentionally ignore failed read to keep current UX
  }

  productImageFileInput.value = "";
});

productImagesList.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement) || !productEditorState) return;

  const button = target.closest(".image-remove");
  if (!(button instanceof HTMLElement)) return;

  const index = Number(button.dataset.index);
  if (!Number.isInteger(index) || index < 0 || index >= productEditorState.draft.images.length) return;

  productEditorState.draft.images = productEditorState.draft.images.filter((_, itemIndex) => itemIndex !== index);
  renderProductEditorDraft();
});

productForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!productEditorState) return;

  const name = normalizeText(productNameInput.value);
  if (!name) return;

  const draft = {
    ...productEditorState.draft,
    name,
    description: normalizeText(productDescriptionInput.value),
    type: normalizeText(productTypeInput.value),
    flavor: normalizeText(productFlavorInput.value),
    age: normalizeText(productAgeInput.value),
    price: normalizePrice(productPriceInput.value),
    weights: [...productEditorState.draft.weights],
    images: [...productEditorState.draft.images]
  };

  const nextCatalog = withUpdatedCategory(productEditorState.categoryId, (category) => ({
    ...category,
    products:
      productEditorState.mode === "create"
        ? [...category.products, draft]
        : category.products.map((product) => (product.id === productEditorState.productId ? draft : product))
  }));

  saveAndRender(nextCatalog);
  closeAllModals();
});

confirmDeleteBtn.addEventListener("click", () => {
  if (!deleteState) return;

  if (deleteState.type === "category") {
    expandedCategoryIds.delete(deleteState.categoryId);

    saveAndRender({
      ...catalog,
      categories: catalog.categories.filter((category) => category.id !== deleteState.categoryId)
    });

    closeAllModals();
    return;
  }

  if (deleteState.type === "product") {
    saveAndRender(
      withUpdatedCategory(deleteState.categoryId, (category) => ({
        ...category,
        products: category.products.filter((product) => product.id !== deleteState.productId)
      }))
    );

    closeAllModals();
  }
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", closeAllModals);
});

document.querySelectorAll("[data-close-one]").forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.getAttribute("data-close-one");
    if (!key || !modals[key]) return;

    closeModal(modals[key]);

    if (key === "addWeight") {
      addWeightForm.reset();
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeAllModals();
  }
});

ordersList?.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLSelectElement)) return;
  const orderId = String(target.dataset.orderId || "");
  if (!orderId) return;
  const nextStatus = String(target.value || "");
  if (!ORDER_STATUSES.includes(nextStatus)) return;

  updateOrderById(orderId, (order) => ({ ...order, status: nextStatus }));
});

ordersList?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const wrapper = target.closest(".order-items-edit");
  if (!(wrapper instanceof HTMLElement)) return;
  const orderId = String(wrapper.dataset.orderId || "");
  if (!orderId) return;

  if (target.classList.contains("order-item-add")) {
    updateOrderById(orderId, (order) => {
      const items = normalizeOrderItems(order.items);
      items.push({ id: "", name: "Новый товар", quantity: 1, price: 0, image: "" });
      return { ...order, items, total: calcOrderTotal(items) };
    });
    return;
  }

  if (target.classList.contains("order-item-remove")) {
    const itemRow = target.closest(".order-item-edit");
    if (!itemRow) return;
    const index = Number(itemRow.getAttribute("data-item-index"));
    if (!Number.isInteger(index)) return;
    updateOrderById(orderId, (order) => {
      const items = normalizeOrderItems(order.items).filter((_, idx) => idx !== index);
      return { ...order, items, total: calcOrderTotal(items) };
    });
  }
});

ordersList?.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const row = target.closest(".order-item-edit");
  if (!row) return;
  const wrapper = target.closest(".order-items-edit");
  if (!(wrapper instanceof HTMLElement)) return;
  const orderId = String(wrapper.dataset.orderId || "");
  const index = Number(row.getAttribute("data-item-index"));
  if (!orderId || !Number.isInteger(index)) return;

  const nameInput = row.querySelector(".order-item-name");
  const qtyInput = row.querySelector(".order-item-qty");
  const priceInput = row.querySelector(".order-item-price");
  if (!(nameInput instanceof HTMLInputElement)) return;
  if (!(qtyInput instanceof HTMLInputElement)) return;
  if (!(priceInput instanceof HTMLInputElement)) return;

  updateOrderById(orderId, (order) => {
    const items = normalizeOrderItems(order.items);
    if (!items[index]) return order;
    items[index] = {
      ...items[index],
      name: String(nameInput.value || "Товар"),
      quantity: Math.max(1, Number(qtyInput.value) || 1),
      price: Math.max(0, Number(priceInput.value) || 0)
    };
    return { ...order, items, total: calcOrderTotal(items) };
  });
});

initTabs();
renderCatalog();
