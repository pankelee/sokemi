/**
 * SOKEMI Pet Shop - Interactive Scripts
 */
 

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    initMobileMenu();
    
    // Smooth Scroll
    initSmoothScroll();
    
    // Header Scroll Effect
    initHeaderScroll();
    
    // Card Hover Effects
    initCardEffects();
    
    // Search Focus Effect
    initSearchFocus();
    
    // Newsletter Form
    initNewsletterForm();

    // Home Page Product Cards
    initHomeProductCards();
});

/**
 * Mobile Menu Functionality
 */
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const menuClose = document.querySelector('.mobile-menu-close');
    const mobileMenu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    
    if (!menuBtn || !mobileMenu) return;
    
    function openMenu() {
        mobileMenu.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Animate hamburger to X
        const spans = menuBtn.querySelectorAll('span');
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    }
    
    function closeMenu() {
        mobileMenu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset hamburger
        const spans = menuBtn.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '1';
        spans[2].style.transform = '';
    }
    
    menuBtn.addEventListener('click', openMenu);
    menuClose.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);
    
    // Close menu when clicking on links
    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            closeMenu();
        }
    });
}

/**
 * Smooth Scroll for Anchor Links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Header Scroll Effect
 */
function initHeaderScroll() {
    const header = document.querySelector('.header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Add shadow on scroll
        if (currentScroll > 10) {
            header.style.boxShadow = '0 4px 20px rgba(5, 98, 164, 0.15)';
        } else {
            header.style.boxShadow = '0 2px 8px rgba(5, 98, 164, 0.1)';
        }
        
        lastScroll = currentScroll;
    });
}

/**
 * Card Hover Effects
 */
function initCardEffects() {
    const cards = document.querySelectorAll('.card, .popular-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.zIndex = '10';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.zIndex = '';
        });
    });
}

/**
 * Search Focus Effect
 */
function initSearchFocus() {
    const searchInput = document.querySelector('.search-input');
    const searchWrapper = document.querySelector('.search-wrapper');
    
    if (!searchInput || !searchWrapper) return;
    
    searchInput.addEventListener('focus', () => {
        searchWrapper.style.transform = 'scale(1.02)';
    });
    
    searchInput.addEventListener('blur', () => {
        searchWrapper.style.transform = 'scale(1)';
    });
}

/**
 * Newsletter Form
 */
function initNewsletterForm() {
    const form = document.querySelector('.newsletter-form');
    const input = document.querySelector('.newsletter-input');
    
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = input.value.trim();
        
        if (!email) {
            showNotification('Пожалуйста, введите email', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Пожалуйста, введите корректный email', 'error');
            return;
        }
        
        // Simulate form submission
        showNotification('Спасибо за подписку!', 'success');
        input.value = '';
    });
}

/**
 * Home Page Product Cards
 */
function initHomeProductCards() {
    if (!document.body.classList.contains("home-page")) return;

    const cards = document.querySelectorAll(".product-card");
    if (!cards.length) return;

    const catalogProducts = readCatalogProductsSafe();
    const favorites = readFavoritesSafe();
    const favoritesMeta = readFavoritesMeta();

    cards.forEach((card, index) => {
        const product = buildHomeProductFromCard(card, index, catalogProducts);
        if (!product) return;

        const qtyValue = card.querySelector(".card-qty-value");
        const qtyMinus = card.querySelector(".card-qty-btn:nth-of-type(1)");
        const qtyPlus = card.querySelector(".card-qty-btn:nth-of-type(2)");
        const addBtn = card.querySelector(".card-add-btn");
        const detailsBtn = card.querySelector(".card-details-btn");
        const weightSelect = card.querySelector(".card-weight-select");
        const favoriteBtn = card.querySelector(".favorite-btn");

        if (weightSelect) {
            applyHomeWeights(weightSelect, product.weights);
        }

        if (favoriteBtn) {
            if (favorites.has(product.id)) {
                favoriteBtn.classList.add("is-active");
            }
            favoriteBtn.addEventListener("click", () => {
                if (favorites.has(product.id)) {
                    favorites.delete(product.id);
                    favoriteBtn.classList.remove("is-active");
                    if (product.source === "home") {
                        delete favoritesMeta[product.id];
                        saveFavoritesMeta(favoritesMeta);
                    }
                    if (typeof showNotification === "function") {
                        showNotification("Удалено из избранного", "info");
                    }
                } else {
                    favorites.add(product.id);
                    favoriteBtn.classList.add("is-active");
                    if (product.source === "home") {
                        favoritesMeta[product.id] = {
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: normalizeImagePath(product.image),
                            meta: buildHomeMetaText(card)
                        };
                        saveFavoritesMeta(favoritesMeta);
                    }
                    if (typeof showNotification === "function") {
                        showNotification("Добавлено в избранное", "success");
                    }
                }
                saveFavoritesSafe(favorites);
            });
        }

        if (qtyValue && qtyMinus && qtyPlus) {
            qtyMinus.addEventListener("click", () => {
                const next = Math.max(1, getQtyFromNode(qtyValue) - 1);
                qtyValue.textContent = String(next);
            });
            qtyPlus.addEventListener("click", () => {
                const next = Math.min(99, getQtyFromNode(qtyValue) + 1);
                qtyValue.textContent = String(next);
            });
        }

        if (addBtn) {
            addBtn.addEventListener("click", () => {
                const qty = qtyValue ? getQtyFromNode(qtyValue) : 1;
                const selectedWeight = weightSelect ? Number(weightSelect.value) : null;
                addHomeProductToCart(product, qty, selectedWeight);
            });
        }

        if (detailsBtn) {
            detailsBtn.addEventListener("click", () => {
                window.location.href = `/pages/site/catalogue.html#product=${encodeURIComponent(product.id)}`;
            });
        }
    });
}

function buildHomeProductFromCard(card, index, catalogProducts) {
    const nameEl = card.querySelector("h4");
    const descEl = card.querySelector(".product-description");
    const imgEl = card.querySelector("img");
    const priceEl = card.querySelector(".price");
    const weightSelect = card.querySelector(".card-weight-select");

    const fallbackId = `home-product-${index + 1}`;
    const cardId = String(card.dataset.productId || "").trim();
    const cardName = String(nameEl?.textContent || "").trim() || "Товар";

    const catalogMatch = resolveHomeProductFromCatalog(
        catalogProducts,
        cardId,
        cardName,
        extractCardCategory(card)
    );
    if (catalogMatch) {
        const selectWeights = readWeightsFromSelect(weightSelect);
        const catalogWeights = Array.isArray(catalogMatch.weights)
            ? catalogMatch.weights.map((w) => Number(w)).filter((w) => Number.isFinite(w) && w > 0)
            : [];
        return {
            id: String(catalogMatch.id || fallbackId),
            baseId: String(catalogMatch.id || fallbackId),
            key: String(catalogMatch.key || catalogMatch.id || fallbackId),
            name: String(catalogMatch.name || cardName),
            description: String(catalogMatch.description || String(descEl?.textContent || "").trim()),
            price: Number(catalogMatch.price) || 0,
            image: String(catalogMatch.image || catalogMatch.images?.[0] || normalizeImagePath(imgEl?.getAttribute("src")) || ""),
            weights: catalogWeights.length ? catalogWeights : selectWeights,
            source: "catalog"
        };
    }

    const id = cardId || fallbackId;
    const name = cardName;
    const description = String(descEl?.textContent || "").trim();
    const image = normalizeImagePath(imgEl?.getAttribute("src"));

    const priceRaw = card.dataset.productPrice || priceEl?.textContent || "0";
    const price = Number(String(priceRaw).replace(/[^\d.]/g, "")) || 0;

    const weights = readWeightsFromSelect(weightSelect);

    return {
        id,
        baseId: id,
        key: id,
        name,
        description,
        price,
        image,
        weights,
        source: "home"
    };
}

function getQtyFromNode(node) {
    const value = Number(String(node.textContent || "").trim());
    return Number.isFinite(value) && value > 0 ? value : 1;
}

function readCatalogProductsSafe() {
    try {
        const raw = localStorage.getItem("sokemi.catalog.v2");
        const parsed = raw ? JSON.parse(raw) : null;
        const categories = Array.isArray(parsed?.categories) ? parsed.categories : [];
        const products = [];

        categories.forEach((category) => {
            const categoryName = String(category?.name || "").trim();
            const categoryImage = String(category?.imageUrl || "").trim();
            const list = Array.isArray(category?.products) ? category.products : [];
            list.forEach((product) => {
                if (!product || (!product.id && !product.name)) return;
                const image =
                    String(product?.image || "").trim() ||
                    (Array.isArray(product?.images) && product.images.length
                        ? String(product.images[0] || "").trim()
                        : "") ||
                    categoryImage;
                products.push({
                    ...product,
                    categoryName,
                    image
                });
            });
        });

        return products;
    } catch {
        return [];
    }
}

function resolveHomeProductFromCatalog(catalogProducts, cardId, cardName, cardCategory) {
    if (!Array.isArray(catalogProducts) || !catalogProducts.length) return null;

    if (cardId) {
        const byId = catalogProducts.find((item) => String(item?.id || "") === cardId);
        if (byId) return byId;
    }

    const normalized = normalizeTitle(cardName);
    if (!normalized) return null;

    const byName = catalogProducts.find((item) => normalizeTitle(String(item?.name || "")) === normalized);
    if (byName) return byName;

    if (cardCategory) {
        const categoryMatch = catalogProducts.find(
            (item) => normalizeTitle(String(item?.categoryName || "")) === normalizeTitle(cardCategory)
        );
        if (categoryMatch) return categoryMatch;
    }

    return null;
}

function normalizeTitle(value) {
    return String(value || "").trim().toLowerCase();
}

function extractCardCategory(card) {
    const meta = String(card.querySelector(".product-meta")?.textContent || "");
    const parts = meta.split("•").map((item) => item.trim());
    const categoryPart = parts.find((item) => item.toLowerCase().startsWith("категория"));
    if (!categoryPart) return "";
    return categoryPart.replace(/категория\\s*:\\s*/i, "").trim();
}

function readWeightsFromSelect(select) {
    const weights = [];
    if (!select) return weights;
    Array.from(select.options).forEach((opt) => {
        const val = Number(opt.value);
        if (Number.isFinite(val) && val > 0) weights.push(val);
    });
    return weights;
}

function normalizeImagePath(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (raw.startsWith("http") || raw.startsWith("/")) return raw;
    if (raw.startsWith("./")) return `/${raw.slice(2)}`;
    return `/${raw}`;
}

function buildHomeMetaText(card) {
    const meta = String(card.querySelector(".product-meta")?.textContent || "").trim();
    return meta || "Категория: не указана";
}

function applyHomeWeights(select, weights) {
    const normalized = Array.isArray(weights)
        ? weights.map((item) => Number(item)).filter((item) => Number.isFinite(item) && item > 0)
        : [];

    const unique = Array.from(new Set(normalized));
    if (!unique.length) {
        select.innerHTML = '<option value="">Вес не указан</option>';
        select.disabled = true;
        return;
    }

    select.innerHTML = unique
        .map((weight, index) => {
            const selected = index === 0 ? "selected" : "";
            return `<option value="${weight}" ${selected}>${weight} г</option>`;
        })
        .join("");
    select.disabled = false;
}

function readFavoritesSafe() {
    try {
        const raw = localStorage.getItem("favorites");
        const parsed = raw ? JSON.parse(raw) : [];
        return new Set(Array.isArray(parsed) ? parsed.map((item) => String(item)) : []);
    } catch {
        return new Set();
    }
}

function saveFavoritesSafe(favorites) {
    localStorage.setItem("favorites", JSON.stringify([...favorites]));
}

function readFavoritesMeta() {
    try {
        const raw = localStorage.getItem("favorites.meta");
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
}

function saveFavoritesMeta(meta) {
    localStorage.setItem("favorites.meta", JSON.stringify(meta || {}));
}

function normalizeSelectedWeight(weights, maybeWeight) {
    if (!weights.length) return null;
    const numeric = Number(maybeWeight);
    if (Number.isFinite(numeric) && weights.includes(numeric)) {
        return numeric;
    }
    return weights[0];
}

function makeCartItemId(productId, selectedWeight) {
    if (!selectedWeight) return String(productId);
    return `${productId}::${selectedWeight}`;
}

function addHomeProductToCart(product, quantity, selectedWeight) {
    const safeQty = Math.max(1, Math.min(99, Number(quantity) || 1));
    const normalizedWeight = normalizeSelectedWeight(product.weights, selectedWeight);
    const cartItemId = makeCartItemId(product.id, normalizedWeight);
    const cart = readCartSafe();
    const existing = cart.find((item) => item.id === cartItemId);

    if (existing) {
        existing.quantity = (Number(existing.quantity) || 0) + safeQty;
    } else {
        cart.push({
            id: cartItemId,
            baseId: product.baseId,
            key: product.key,
            name: product.name,
            description: product.description,
            price: product.price,
            image: normalizeImagePath(product.image),
            quantity: safeQty,
            selectedWeight: normalizedWeight
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    if (typeof updateCartBadge === "function") updateCartBadge();
    document.dispatchEvent(new Event("cart:updated"));
    showNotification("Товар добавлен в корзину", "success");
}

/**
 * Email Validation
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Show Notification
 */
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#5fa8d3'};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 16px;
        z-index: 10000;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        opacity: 0.8;
        transition: opacity 0.2s;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
`;
document.head.appendChild(style);

/**
 * Intersection Observer for Scroll Animations
 */
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe sections
document.querySelectorAll('.catalog, .popular').forEach(section => {
    section.style.opacity = '0.9';
    section.style.transform = 'translateY(10px)';
    section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(section);
});

/**
 * Cart Button Click
 */
document.querySelectorAll('.cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        showNotification('Корзина пока пуста', 'info');
    });
});

/**
 * Lazy Loading for Images
 */
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img').forEach(img => {
        imageObserver.observe(img);
    });
    
}
/* ===== UNIVERSAL CART BADGE ===== */

document.addEventListener("DOMContentLoaded", () => {
    updateCartBadge();
});

function updateCartBadge() {
    const badge = document.getElementById("cart-count-badge");
    if (!badge) return;

    const cart = readCartSafe();
    const uniqueCount = cart.reduce((sum, item) => {
        const qty = Number(item?.quantity) || 0;
        return qty > 0 ? sum + 1 : sum;
    }, 0);

    badge.textContent = uniqueCount > 0 ? String(uniqueCount) : "0";
}

/* автообновление если localStorage меняется */
window.addEventListener("storage", updateCartBadge);

initCartBadgeAutoUpdate();

function readCartSafe() {
    try {
        const raw = localStorage.getItem("cart");
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function initCartBadgeAutoUpdate() {
    if (window.__sokemiCartBadgeHooked) return;
    window.__sokemiCartBadgeHooked = true;

    const originalSetItem = localStorage.setItem.bind(localStorage);
    const originalRemoveItem = localStorage.removeItem.bind(localStorage);
    const originalClear = localStorage.clear.bind(localStorage);

    localStorage.setItem = (key, value) => {
        originalSetItem(key, value);
        if (key === "cart") updateCartBadge();
    };

    localStorage.removeItem = (key) => {
        originalRemoveItem(key);
        if (key === "cart") updateCartBadge();
    };

    localStorage.clear = () => {
        originalClear();
        updateCartBadge();
    };

    document.addEventListener("cart:updated", updateCartBadge);
}

console.log('🐾 SOKEMI Pet Shop loaded successfully!');
