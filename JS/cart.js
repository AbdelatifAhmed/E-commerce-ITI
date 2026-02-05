const cartPayBtn = document.querySelector(".cart-pay-btn");
cartPayBtn?.addEventListener("click", () => openPaymentModal());

const checkoutBtn = document.querySelector(".checkout-btn");
checkoutBtn?.addEventListener("click", () => openPaymentModal());

const cartPageContainer = document.getElementById("cart-items-container");
const cartCountTitle = document.getElementById("cart-count-title");
const subtotalEl = document.getElementById("subtotal");
const grandTotalEl = document.getElementById("grand-total");

async function displayCart() {
    const container = document.getElementById('cart-items-container');
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));


    if (!currentUser || !currentUser.cart || currentUser.cart.length === 0) {
        console.warn("Cart is empty or user is not logged in.");
        container.innerHTML = `<p style="text-align: center;
    margin-top: 20px;
    font-size: 1.2rem;
    color: #888;">your cart is empty</p>`;
        return;
    }

    try {        
        const fetchPromises = currentUser.cart.map(item => {
            return fetch(`https://fakestoreapi.com/products/${item.id}`).then(res => {
                if(!res.ok) throw new Error("Failed to fetch product data");
                return res.json();
            });
        });
        const products = await Promise.all(fetchPromises);
        renderCartItems(products, currentUser.cart);
    } catch (error) {
        console.error(error);
    }
}

function renderCartItems(products, cartMetadata) {
    const container = document.getElementById('cart-items-container');
    container.innerHTML = '';
    let subtotal = 0;

    products.forEach((product, index) => {
        const qty = cartMetadata[index].quantity;
        subtotal += product.price * qty;

        container.innerHTML += `
            <div class="cart-item">
                <img src="${product.image}" class="item-img">
                <div class="item-details">
                    <h4>${product.title}</h4>
                    <p>الفئة: ${product.category}</p>
                    <div class="item-controls">
                        <button class="qty-btn" onclick="updateQty(${product.id}, -1)">-</button>
                        <span>${qty}</span>
                        <button class="qty-btn" onclick="updateQty(${product.id}, 1)">+</button>
                    </div>
                </div>
                <div class="item-price">
                    <strong>$${(product.price * qty).toFixed(2)}</strong>
                </div>
                <i class="fa-solid fa-trash remove-item" onclick="removeItem(${product.id})"></i>
            </div>
        `;
    });

    updateSummary(subtotal);
}

function updateSummary(subtotal) {
    document.getElementById('subtotal').innerText = `$${subtotal.toFixed(2)}`;
    document.getElementById('grand-total').innerText = `$${(subtotal + 10).toFixed(2)}`;
    document.getElementById('cart-count-title').innerText = `(${JSON.parse(localStorage.getItem('currentUser')).cart.length})`;
}

function updateQty(id, change) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let item = currentUser.cart.find(i => i.id == id);

    if (item) {
        item.quantity += change;
        if (item.quantity < 1) return removeItem(id);

        saveAndRefresh(currentUser);
    }
}

function removeItem(id) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    currentUser.cart = currentUser.cart.filter(i => i.id != id);
    saveAndRefresh(currentUser);
}

function saveAndRefresh(user) {
    let users = JSON.parse(localStorage.getItem('users'));
    let index = users.findIndex(u => u.id === user.id);
    users[index] = user;

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(user));
    displayCart();
}

displayCart();