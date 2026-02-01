async function renderWishlist() {
    const grid = document.getElementById('wishlist-grid');
    const emptyState = document.getElementById('empty-state');
    const countBadge = document.getElementById('wishlist-count');

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser || !currentUser.wishlist || currentUser.wishlist.length === 0) {
        if (grid) grid.classList.add('hidden');
        if (emptyState) emptyState.classList.remove('hidden');
        if (countBadge) countBadge.innerText = "0";
        return;
    }
    try {
        const fetchPromises = currentUser.wishlist.map(id =>
            fetch(`https://fakestoreapi.com/products/${Number(id)}`)
                .then(res => {
                    if (!res.ok) throw new Error("Product not found");
                    return res.json();
                })
                .catch(err => {
                    console.error("Error fetching product:", err);
                    return null;    
                })
        );
        
        const rawProducts = await Promise.all(fetchPromises);
        
        const products = rawProducts.filter(p => p !== null);
        
        countBadge.innerText = products.length;
        if (products.length === 0) {
            grid.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        grid.classList.remove('hidden');
        emptyState.classList.add('hidden');
        grid.innerHTML = ""; 

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'wishlist-card';
            card.innerHTML = `
                <button class="remove-btn" onclick="removeFromWishlist(${product.id})">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
                <img src="${product.image}" alt="${product.title}">
                <h3 class="product-title">${product.title}</h3>
                <div class="product-price">$${product.price}</div>
                <button class="add-to-cart-btn" onclick="moveToCart(${product.id})">
                    <i class="fa-solid fa-cart-plus"></i> Add to Cart
                </button>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error("Critical Error loading wishlist:", error);
    }
}

function removeFromWishlist(id) {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let users = JSON.parse(localStorage.getItem('users'));

    if (!currentUser || !users) return;

    currentUser.wishlist = currentUser.wishlist.filter(prodId => prodId != id);

    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('users', JSON.stringify(users));
    }

    renderWishlist();
}

function moveToCart(id) {
    if (typeof addProductIdToLocal === 'function') {
        const success = addProductIdToLocal('cart', id, 1);
        if (success) {
            removeFromWishlist(id);
            alert("Product moved to your cart!");
        }
    } else {
        console.error("Function addProductIdToLocal is not defined!");
    }
}

document.addEventListener('DOMContentLoaded', renderWishlist);

function addProductIdToLocal(listKey, productId, quantity = 1) {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) return false;

    const list = user[listKey];
    if (!Array.isArray(list)) user[listKey] = [];

    const idStr = String(productId);
    const times = listKey === "cart" ? Math.max(1, Math.min(100, Number(quantity) || 1)) : 1;
    for (let i = 0; i < times; i++) {
        user[listKey].push(idStr);
    }
    localStorage.setItem("currentUser", JSON.stringify(user))
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1) users[idx] = user;
    else users.push(user);
    localStorage.setItem("users", JSON.stringify(users));
    return true;
}