const menuItems = document.querySelectorAll(".menu-item.has-mega");
const menuBar = document.querySelector(".menu-bar");

function updateMenuPosition() {
    if (!menuBar) return;
    const rect = menuBar.getBoundingClientRect();
    document.documentElement.style.setProperty(
        "--menu-bottom",
        `${rect.bottom + window.scrollY}px`
    );
}

updateMenuPosition();
window.addEventListener("resize", updateMenuPosition);
window.addEventListener("scroll", updateMenuPosition);

menuItems.forEach(item => {
    const mega = item.querySelector(".mega-panel");
    if (!mega) return;

    item.addEventListener("mouseenter", () => {
        closeAll();
        item.classList.add("open");
        mega.style.display = "block";
    });

    item.addEventListener("mouseleave", () => {
        item.classList.remove("open");
        mega.style.display = "none";
    });
});

function closeAll() {
    document.querySelectorAll(".menu-item.has-mega").forEach(i => {
        i.classList.remove("open");
        const m = i.querySelector(".mega-panel");
        if (m) m.style.display = "none";
    });
}

function getUser() {
    try {
        return JSON.parse(localStorage.getItem("currentUser"));
    } catch {
        return null;
    }
}

function setUser(user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
}

function addProductIdToLocal(listKey, productId, quantity = 1) {
    const user = getUser();
    if (!user) return false;

    const list = user[listKey];
    if (!Array.isArray(list)) user[listKey] = [];

    const idStr = String(productId);
    const times = listKey === "cart" ? Math.max(1, Math.min(100, Number(quantity) || 1)) : 1;
    for (let i = 0; i < times; i++) {
        user[listKey].push(idStr);
    }

    setUser(user);
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1) users[idx] = user;
    else users.push(user);
    localStorage.setItem("users", JSON.stringify(users));
    return true;
}

window.addProductIdToLocal = addProductIdToLocal;

const wishlistList = document.querySelector(".wishlist-list");
const wishlistCountEls = document.querySelectorAll(".wishlist-count");

function getWishlist() {
    const user = getUser();
    return user && Array.isArray(user.wishlist) ? user.wishlist : [];
}

async function renderWishlist() {
    if (!wishlistList) return;

    const items = getWishlist();
    wishlistList.innerHTML = "";

    if (!items.length) {
        wishlistList.innerHTML = `<p class="wishlist-empty">No items in wishlist</p>`;
    } else {
        const products = await Promise.all(
            items.map(id =>
                fetch(`https://fakestoreapi.com/products/${id}`).then(r => r.json())
            )
        );

        products.forEach(p => {
            const row = document.createElement("div");
            row.className = "wishlist-item";
            row.innerHTML = `
                <img src="${p.image}" width="30">
                <div>
                    <div>${p.title}</div>
                    <strong>$${p.price}</strong>
                </div>
            `;
            wishlistList.appendChild(row);
        });
    }

    wishlistCountEls.forEach(el => el.textContent = items.length);
}

renderWishlist();

const cartList = document.querySelector(".cart-list");
const cartTotalPriceEl = document.querySelector(".cart-total-price");
const cartCountEls = document.querySelectorAll(".cart-count");

function getCart() {
    const user = getUser();
    return user && Array.isArray(user.cart) ? user.cart : [];
}

function setCart(cart) {
    const user = getUser();
    if (!user) return;
    user.cart = cart;
    setUser(user);
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1) users[idx] = user;
    localStorage.setItem("users", JSON.stringify(users));
}

function cartToItems(cart) {
    if (!Array.isArray(cart) || !cart.length) return [];
    const counts = {};
    cart.forEach((id) => {
        if (id == null || id === '') return;
        const key = String(id);
        const num = Number(key);
        if (Number.isNaN(num)) return;
        counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([id, quantity]) => ({ id: Number(id), quantity }));
}

function itemsToCart(items) {
    const arr = [];
    items.forEach((i) => {
        const id = String(i.id);
        for (let q = 0; q < (i.quantity || 1); q++) arr.push(id);
    });
    return arr;
}

function formatMoney(v) {
    return `$${v.toFixed(2)}`;
}

const FAKE_PAYMENT_API_URL = "https://jsonplaceholder.typicode.com/posts";

async function getCartTotalAsync() {
    const items = cartToItems(getCart());
    if (!items.length) return { subtotal: 0, shipping: 10, total: 10, items: [] };
    const products = await Promise.all(
        items.map((i) =>
            fetch(`https://fakestoreapi.com/products/${i.id}`).then((r) => r.json())
        )
    );
    let subtotal = 0;
    products.forEach((p, idx) => {
        subtotal += p.price * (items[idx].quantity || 1);
    });
    const shipping = 10;
    return { subtotal, shipping, total: subtotal + shipping, items };
}

function fakePaymentApiCharge(payload) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            fetch(FAKE_PAYMENT_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: "Payment",
                    body: JSON.stringify({
                        amount: payload.amount,
                        currency: payload.currency || "USD",
                        itemCount: payload.items?.length || 0,
                    }),
                    userId: 1,
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    resolve({
                        success: true,
                        transactionId: "txn_" + (data.id || Date.now()),
                    });
                })
                .catch((err) => {
                    reject(new Error(err.message || "Payment failed"));
                });
        }, 1200);
    });
}

let paymentModalEl = null;

function getPaymentModal() {
    if (paymentModalEl) return paymentModalEl;
    const overlay = document.createElement("div");
    overlay.className = "payment-modal-overlay";
    overlay.innerHTML = `
        <div class="payment-modal">
            <div class="payment-modal-header">
                <h3>Complete Payment</h3>
                <button type="button" class="payment-modal-close" aria-label="Close">&times;</button>
            </div>
            <div class="payment-modal-body">
                <p class="payment-order-total">Order total: <strong id="payment-total-display">$0.00</strong></p>
                <p class="payment-hint">Demo: use any card number to test.</p>
                <form class="payment-form" id="payment-form">
                    <label>Card number</label>
                    <input type="text" id="payment-card" placeholder="4242 4242 4242 4242" maxlength="19" autocomplete="off">
                    <label>Expiry (MM/YY)</label>
                    <input type="text" id="payment-expiry" placeholder="12/25" maxlength="5" autocomplete="off">
                    <label>CVC</label>
                    <input type="text" id="payment-cvc" placeholder="123" maxlength="4" autocomplete="off">
                    <p class="payment-message" id="payment-message" role="alert"></p>
                    <div class="payment-modal-actions">
                        <button type="button" class="payment-btn-cancel">Cancel</button>
                        <button type="submit" class="payment-btn-pay" id="payment-submit">Pay now</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    paymentModalEl = overlay;

    overlay.querySelector(".payment-modal-close").onclick = () => closePaymentModal();
    overlay.querySelector(".payment-btn-cancel").onclick = () => closePaymentModal();
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closePaymentModal();
    });
    overlay.querySelector("#payment-form").onsubmit = (e) => {
        e.preventDefault();
        submitPaymentForm();
    };
    return overlay;
}

function closePaymentModal() {
    if (paymentModalEl) {
        paymentModalEl.classList.remove("payment-modal-open");
        paymentModalEl.style.display = "none";
    }
}

function showPaymentMessage(msg, isError) {
    const el = document.getElementById("payment-message");
    if (!el) return;
    el.textContent = msg;
    el.className = "payment-message " + (isError ? "payment-message-error" : "payment-message-success");
    el.style.display = msg ? "block" : "none";
}

async function submitPaymentForm() {
    const submitBtn = document.getElementById("payment-submit");
    const msgEl = document.getElementById("payment-message");
    if (!submitBtn || !msgEl) return;
    showPaymentMessage("");
    submitBtn.disabled = true;
    submitBtn.textContent = "Processing…";

    const totalEl = document.getElementById("payment-total-display");
    const totalStr = totalEl ? totalEl.textContent.replace(/[^0-9.]/g, "") : "0";
    const amount = parseFloat(totalStr) || 0;
    const items = cartToItems(getCart());

    try {
        const result = await fakePaymentApiCharge({
            amount,
            currency: "USD",
            items,
        });
        if (result.success) {
            showPaymentMessage("Payment successful! Transaction: " + result.transactionId, false);
            setCart([]);
            if (typeof renderCart === "function") renderCart();
            if (typeof displayCartPage === "function") displayCartPage();
            setTimeout(() => {
                closePaymentModal();
            }, 2000);
        } else {
            showPaymentMessage("Payment failed. Please try again.", true);
        }
    } catch (err) {
        showPaymentMessage(err.message || "Payment failed. Please try again.", true);
    }
    submitBtn.disabled = false;
    submitBtn.textContent = "Pay now";
}

async function openPaymentModal() {
    const items = cartToItems(getCart());
    if (!items.length) {
        alert("Your cart is empty.");
        return;
    }
    const modal = getPaymentModal();
    const totalEl = document.getElementById("payment-total-display");
    modal.style.display = "flex";
    modal.classList.add("payment-modal-open");
    showPaymentMessage("");

    try {
        const { total } = await getCartTotalAsync();
        if (totalEl) totalEl.textContent = formatMoney(total);
    } catch (_) {
        if (totalEl) totalEl.textContent = "$0.00";
    }
}

async function renderCart() {
    if (!cartList || !cartTotalPriceEl) return;

    const cart = getCart();
    const items = cartToItems(cart);
    cartList.innerHTML = "";

    if (!items.length) {
        cartList.innerHTML = `<p class="cart-empty">Your cart is empty</p>`;
        cartTotalPriceEl.textContent = "$0.00";
        cartCountEls.forEach(el => el.textContent = "0");
        return;
    }

    const products = await Promise.all(
        items.map(i =>
            fetch(`https://fakestoreapi.com/products/${i.id}`).then(r => r.json())
        )
    );

    let total = 0;
    let count = 0;

    products.forEach((p, i) => {
        const qty = items[i].quantity || 1;
        const lineTotal = p.price * qty;

        total += lineTotal;
        count += qty;

        const row = document.createElement("div");
        row.className = "cart-item";
        row.dataset.id = items[i].id;

        row.innerHTML = `
            <div class="cart-thumb">
                <img src="${p.image}" alt="${p.title || ''}">
            </div>
            <div class="cart-info">
                <div class="cart-name">${p.title}</div>
                <div class="cart-meta">
                    <span class="cart-price">${formatMoney(lineTotal)}</span>
                    <div class="cart-qty-controls">
                        <button type="button" class="cart-qty-btn qty-minus" aria-label="Decrease">−</button>
                        <span class="cart-qty-value">${qty}</span>
                        <button type="button" class="cart-qty-btn qty-plus" aria-label="Increase">+</button>
                    </div>
                </div>
            </div>
        `;

        cartList.appendChild(row);
    });

    cartTotalPriceEl.textContent = formatMoney(total);
    cartCountEls.forEach(el => el.textContent = count);
}

window.renderCart = renderCart;

cartList?.addEventListener("click", e => {
    const row = e.target.closest(".cart-item");
    if (!row) return;

    const id = Number(row.dataset.id);
    if (!id || Number.isNaN(id)) return;

    const isMinus = e.target.closest(".qty-minus");
    const isPlus = e.target.closest(".qty-plus");
    if (!isMinus && !isPlus) return;

    let items = cartToItems(getCart());
    const item = items.find((i) => i.id === id);
    if (!item) return;

    if (isMinus) {
        item.quantity--;
        if (item.quantity <= 0) items = items.filter((i) => i.id !== id);
    } else {
        item.quantity++;
    }

    setCart(itemsToCart(items));
    renderCart();
});

renderCart();

const cartPayBtn = document.querySelector(".cart-pay-btn");
cartPayBtn?.addEventListener("click", () => openPaymentModal());

const checkoutBtn = document.querySelector(".checkout-btn");
checkoutBtn?.addEventListener("click", () => openPaymentModal());

const cartPageContainer = document.getElementById("cart-items-container");
const cartCountTitle = document.getElementById("cart-count-title");
const subtotalEl = document.getElementById("subtotal");
const grandTotalEl = document.getElementById("grand-total");

async function displayCartPage() {
    if (!cartPageContainer) return;

    const items = cartToItems(getCart());
    cartPageContainer.innerHTML = "";

    if (!items.length) {
        cartPageContainer.innerHTML = `<p class="cart-empty-msg">Your cart is empty</p>`;
        if (cartCountTitle) cartCountTitle.textContent = "(0)";
        if (subtotalEl) subtotalEl.textContent = "$0.00";
        if (grandTotalEl) grandTotalEl.textContent = "$0.00";
        return;
    }

    const products = await Promise.all(
        items.map(i =>
            fetch(`https://fakestoreapi.com/products/${i.id}`).then(r => r.json())
        )
    );

    let subtotal = 0;
    let count = 0;

    products.forEach((p, i) => {
        const qty = items[i].quantity || 1;
        const total = p.price * qty;

        subtotal += total;
        count += qty;

        const row = document.createElement("div");
        row.className = "cart-item";
        row.innerHTML = `
            <img src="${p.image}" alt="${p.title || ''}" class="item-img">
            <div class="item-details">
                <h4>${p.title}</h4>
                <p>${p.category || ''}</p>
                <div class="item-controls">
                    <button type="button" class="qty-btn page-minus" data-id="${items[i].id}" aria-label="Decrease">−</button>
                    <span>${qty}</span>
                    <button type="button" class="qty-btn page-plus" data-id="${items[i].id}" aria-label="Increase">+</button>
                </div>
            </div>
            <div class="item-price">
                <strong>$${total.toFixed(2)}</strong>
            </div>
            <button type="button" class="remove-item page-remove" data-id="${items[i].id}" aria-label="Remove item" title="Remove">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        cartPageContainer.appendChild(row);
    });

    if (cartCountTitle) cartCountTitle.textContent = `(${count})`;
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (grandTotalEl) grandTotalEl.textContent = `$${(subtotal + 10).toFixed(2)}`;
}

cartPageContainer?.addEventListener("click", e => {
    const btn = e.target.closest("[data-id]");
    const id = btn ? Number(btn.dataset.id) : 0;
    if (!id || Number.isNaN(id)) return;

    const isMinus = e.target.closest(".page-minus");
    const isPlus = e.target.closest(".page-plus");
    const isRemove = e.target.closest(".page-remove");
    if (!isMinus && !isPlus && !isRemove) return;

    let items = cartToItems(getCart());
    const item = items.find((i) => i.id === id);
    if (!item && !isRemove) return;

    if (isMinus) {
        item.quantity--;
        if (item.quantity <= 0) items = items.filter((i) => i.id !== id);
    } else if (isPlus) {
        item.quantity++;
    } else if (isRemove) {
        items = items.filter((i) => i.id !== id);
    }

    setCart(itemsToCart(items));
    displayCartPage();
    renderCart();
});

displayCartPage();

window.addEventListener("storage", e => {
    if (e.key === "currentUser") {
        renderWishlist();
        renderCart();
        displayCartPage();
    }
});
