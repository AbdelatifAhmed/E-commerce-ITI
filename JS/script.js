document.querySelectorAll('.category-header').forEach(header => {
    header.addEventListener('click', () => {
        const parent = header.parentElement;
        const icon = header.querySelector('.toggle-icon');
        const isOpen = parent.classList.contains('active');
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
            item.querySelector('.toggle-icon').textContent = '+';
        });
        if (!isOpen) {
            parent.classList.add('active');
            icon.textContent = '-';
        } else {
            parent.classList.remove('active');
            icon.textContent = '+';
        }
    });
});

// toast
const toast = document.getElementById('toast');
function showToast() {
    toast.classList.add('active');
    setTimeout(() => {
        toast.classList.remove('active');
    }, 5000);
}
setTimeout(showToast, 2000);
setInterval(showToast, 15000);

// -----------------------------------------

// modal in the first appear
const modal = document.getElementById('modal');
const openButton = document.getElementById('openModalButton');
const closeButton = document.getElementById('closeModalButton');

setTimeout(() => modal.showModal(), 5000);

closeButton.addEventListener('click', () => {
    modal.close();
});


// ----------------------------------------


window.onload = async function () {
    const data = await fetch('https://fakestoreapi.com/products');
    const products = await data.json();
    
    const wrapper = document.querySelector('.products-wrapper');
    
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'products-card';
        card.setAttribute('data-id', product.id); 

        let isFav = currentUser && currentUser.wishlist.includes(String(product.id));

        card.innerHTML = `
            <div class="product-img-wrapper">
                <div class="product-img1">
                    <img src="${product.image}" alt="">
                </div>
                <div class="product-actions">
                    <button class="action-btn wishlist-btn ${isFav ? 'active-wishlist' : ''}">
                        <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                    </button>
                    <button class="action-btn view-btn"><i class="fa-regular fa-eye"></i></button>
                    <button class="action-btn"><i class="fa-solid fa-arrows-rotate"></i></button>
                    <button class="action-btn cart-btn" title="Add to cart"><i class="fa-solid fa-bag-shopping"></i></button>
                </div>
            </div>
            <div class="products-text">
                <span class="category">${product.category}</span>
                <h3 class="product-title">${product.title}</h3>
                <div class="stars">
                    <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
                    <i class="fa-regular fa-star"></i><i class="fa-regular fa-star"></i>
                </div>
                <div class="price">
                    <span class="current-price">$${product.price}</span>
                    <del class="old-price">$${Math.floor(product.price * 1.2)}</del>
                </div>
            </div>
        `;
        
        const wishlistBtn = card.querySelector('.wishlist-btn');
        const viewBtn = card.querySelector('.view-btn');
        const cartBtn = card.querySelector('.cart-btn');

        wishlistBtn.onclick = function() {
            if (!currentUser) return alert("Please login first!");

            let users = JSON.parse(localStorage.getItem('users'));
            let userIndex = users.findIndex(u => u.id === currentUser.id);
            let prodId = String(product.id);

            if (currentUser.wishlist.includes(prodId)) {
                currentUser.wishlist = currentUser.wishlist.filter(id => id !== prodId);
                this.classList.remove('active-wishlist');
                this.querySelector('i').classList.replace('fa-solid', 'fa-regular');
            } else {
                currentUser.wishlist.push(prodId);
                this.classList.add('active-wishlist');
                this.querySelector('i').classList.replace('fa-regular', 'fa-solid');
            }

            users[userIndex] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            window.renderWishlist();
        };

        viewBtn.onclick = function() {
            window.location.href = `product.html?id=${product.id}`;
        };

        // Add to cart: store product ID in localStorage like wishlist, then refresh cart display
        cartBtn.onclick = function() {
            var user = null;
            try { user = JSON.parse(localStorage.getItem('currentUser')); } catch (e) {}
            if (!user) {
                alert("Please login first!");
                return;
            }
            if (typeof window.addProductIdToLocal === 'function') {
                window.addProductIdToLocal('cart', product.id, 1);
            } else {
                if (!Array.isArray(user.cart)) user.cart = [];
                user.cart.push(String(product.id));
                var users = JSON.parse(localStorage.getItem('users')) || [];
                var userIndex = users.findIndex(function(u) { return u.id === user.id; });
                if (userIndex !== -1) users[userIndex] = user;
                else users.push(user);
                localStorage.setItem('users', JSON.stringify(users));
                localStorage.setItem('currentUser', JSON.stringify(user));

            }
            if (typeof window.renderCart === 'function') window.renderCart();
        };

        wrapper.appendChild(card);
    });
};

function updateAccountMenu() {
    const guestOnly = document.querySelector(".account-guest-only");
    const userOnly = document.querySelector(".account-user-only");
    // if (!guestOnly || !userOnly) return;

const user =JSON.parse(localStorage.getItem('currentUser'));

    if (user) {
        guestOnly.style.display = "none";
        userOnly.style.display = "block";
    } else {
        guestOnly.style.display = "block";
        userOnly.style.display = "none";
    }
}
updateAccountMenu();
window.addEventListener("storage", function (e) {
    if (e.key === "currentUser") {
        updateAccountMenu();
    }
});

const logOut = document.getElementById('account-logout');
logOut.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.reload();
    updateAccountMenu();
});