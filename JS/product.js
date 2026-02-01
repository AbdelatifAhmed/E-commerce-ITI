async function loadProduct() {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return window.location.href = 'index.html';

    try {
        const response = await fetch(`https://fakestoreapi.com/products/${id}`);
        const product = await response.json();
        renderUI(product);
    } catch (error) {
        console.error("Failed to fetch product data", error);
    }
}

function renderUI(product) {
    const content = document.getElementById('product-content');
    content.innerHTML = `
        <div class="image-gallery">
            <img src="${product.image}" alt="${product.title}">
        </div>
        
        <div class="product-details">
            <span class="badge">${product.category}</span>
            <h1>${product.title}</h1>
            
            <div class="rating-box">
                <div class="stars" style="color: #f1c40f">
                    ${Array(Math.round(product.rating.rate)).fill('<i class="fa-solid fa-star"></i>').join('')}
                </div>
                <span style="color: #888">(${product.rating.count} مراجعة)</span>
            </div>

            <p class="description" style="color: #666; line-height: 1.8;">${product.description}</p>
            
            <div class="price-tag">$${product.price}</div>

            <div class="purchase-actions">
                <input type="number" value="1" min="1" class="qty-input" id="qty">
                <button class="btn-primary" onclick="handleAddToCart(${product.id})">
                    <i class="fa-solid fa-cart-shopping"></i> add to cart
                                    </button>
                <button class="btn-wishlist">
                    <i class="fa-regular fa-heart"></i>
                </button>
            </div>

            <div class="trust-badges">
                <div class="trust-badge">
                    <i class="fa-solid fa-truck"></i>
                    <div class="trust-badge-text">
                        <h4>Free Delivery</h4>
                        <p>Enter your postal code for Delivery Availability</p>
                    </div>
                </div>
                <div class="trust-badge">
                    <i class="fa-solid fa-shield"></i>
                    <div class="trust-badge-text">
                        <h4>Secure Payment</h4>
                        <p>100% Secure Payment</p>
                    </div>
                </div>
                <div class="trust-badge">
                    <i class="fa-solid fa-rotate "></i>
                    <div class="trust-badge-text">
                        <h4>Return Delivery</h4>
                        <p>Free 30 Days Delivery Returns</p>
                    </div>
                </div>
              
            </div>
        </div>
    `;
}



//--------------------------------------------------------------------------------------------
function handleAddToCart(id) {
    const qtyInput = document.getElementById('qty');
    const rawQty = qtyInput ? parseInt(qtyInput.value, 10) : 1;
    const qty = Math.max(1, Math.min(100, isNaN(rawQty) ? 1 : rawQty));

    if (typeof window.addProductIdToLocal === 'function') {
        const ok = window.addProductIdToLocal('cart', id, qty);
        if (!ok) {
            alert("Please login first!");
            window.location.href = 'auth.html';
            return;
        }
        alert(`Added ${qty} ${qty > 1 ? 'items' : 'item'} to your cart.`);
        return;
    }

    
    let currentUser = null;
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
    } catch (_) {}
    if (!currentUser) {
        alert("Please login first!");
        window.location.href = 'auth.html';
        return;
    }
    if (!Array.isArray(currentUser.cart)) currentUser.cart = [];
    const productId = String(id);
    for (let i = 0; i < qty; i++) currentUser.cart.push(productId);
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex((u) => u.id === currentUser.id);
    if (userIndex !== -1) users[userIndex] = currentUser;
    else users.push(currentUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    alert(`Added ${qty} ${qty > 1 ? 'items' : 'item'} to your cart.`);
}

loadProduct();