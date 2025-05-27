// ---------------- SHOP CART FUNCTIONALITY WITH CHECKOUT MODAL -------------------
// This script manages the shop cart: adding/removing items, dynamic pricing per size,
// PHP currency formatting, and modal checkout with order confirmation.

/*
    CART & PRODUCT DATA INITIALIZATION
*/
const cart = [];
const cartItems = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
const shopItems = document.querySelectorAll('.shop-item');
const checkoutBtn = document.querySelector('.checkout-btn');

// List of products and their prices per size
const productData = [
    { name: 'Classic White Tee', prices: { S: 900, M: 950, L: 1000, XL: 1050 } },
    { name: 'Eco Denim Jacket', prices: { S: 2200, M: 2300, L: 2400, XL: 2500 } },
    { name: 'Urban Joggers', prices: { S: 1500, M: 1550, L: 1600, XL: 1700 } },
    { name: 'Minimalist Hoodie', prices: { S: 1400, M: 1450, L: 1500, XL: 1550 } },
    { name: 'Minimalist Hoodie', prices: { S: 1400, M: 1450, L: 1500, XL: 1550 } },
    { name: 'Minimalist Hoodie', prices: { S: 1400, M: 1450, L: 1500, XL: 1550 } },
    { name: 'Minimalist Hoodie', prices: { S: 1400, M: 1450, L: 1500, XL: 1550 } },
    { name: 'Minimalist Hoodie', prices: { S: 1400, M: 1450, L: 1500, XL: 1550 } }
];

// Format numbers as PHP currency
function formatPHP(amount) {
    return '₱' + amount.toLocaleString('en-PH', { minimumFractionDigits: 2 });
}

/*
    PRODUCT PRICE DISPLAY (Updates price shown when size changes)
*/
shopItems.forEach((item, idx) => {
    const select = item.querySelector('select');
    const priceElem = item.querySelector('.price');
    // When user changes size, update price display
    select.addEventListener('change', function () {
        const size = select.value;
        const price = productData[idx].prices[size];
        priceElem.textContent = formatPHP(price);
    });
    // Set initial price based on default size
    const initSize = select.value;
    priceElem.textContent = formatPHP(productData[idx].prices[initSize]);
});

/*
    ADD TO CART BUTTON HANDLER
    - Adds the selected product (with size and price) to the cart and re-renders the cart.
*/
addToCartBtns.forEach((btn, idx) => {
    btn.addEventListener('click', function() {
        const select = btn.parentElement.querySelector('select');
        const size = select.value;
        const price = productData[idx].prices[size];
        const item = {
            name: productData[idx].name,
            price: price,
            size: size,
            id: Date.now() + Math.random() // Unique ID for each cart item
        };
        cart.push(item);
        renderCart();
    });
});

/*
    RENDER CART
    - Updates the cart item list and total.
    - Enables/disables checkout button.
    - Attaches remove button handlers.
*/
function renderCart() {
    cartItems.innerHTML = '';
    if (cart.length === 0) {
        cartItems.innerHTML = '<li>Your cart is empty.</li>';
        cartTotalPrice.textContent = formatPHP(0);
        checkoutBtn.disabled = true;
        checkoutBtn.classList.add('disabled');
        return;
    }
    let total = 0;
    cart.forEach((item, i) => {
        total += item.price;
        const li = document.createElement('li');
        li.innerHTML = `${item.name} (${item.size}) - ${formatPHP(item.price)}
            <button class="remove-cart-item" data-id="${item.id}" title="Remove">✕</button>`;
        cartItems.appendChild(li);
    });
    cartTotalPrice.textContent = formatPHP(total);

    // Remove item from cart on button click
    document.querySelectorAll('.remove-cart-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = btn.getAttribute('data-id');
            removeCartItem(id);
        });
    });

    // Enable checkout button if cart is not empty
    checkoutBtn.disabled = false;
    checkoutBtn.classList.remove('disabled');
}

/*
    REMOVE CART ITEM BY ID
*/
function removeCartItem(id) {
    const idx = cart.findIndex(item => item.id == id);
    if (idx !== -1) {
        cart.splice(idx, 1);
        renderCart();
    }
}

/*
    CHECKOUT LOGIC
    - Shows a modal with cart summary and allows order confirmation.
    - Shows error if cart is empty.
*/
checkoutBtn.addEventListener('click', function() {
    if (cart.length === 0) {
        // Show a modal if cart is empty
        showPopup(`
            <h2>Cart is Empty</h2>
            <p>Please add items to your cart before checking out.</p>
            <div style="margin-top:24px;text-align:center;">
                <button id="close-empty-popup" style="padding:8px 22px;background:#1f7a54;color:#fff;border:none;border-radius:4px;cursor:pointer;">Close</button>
            </div>
        `);
        document.getElementById('close-empty-popup').onclick = closePopup;
        return;
    }

    // Build the order summary HTML
    let summaryHtml = `<h2>Order Summary</h2><ul style="padding-left:20px;">`;
    cart.forEach(item => {
        summaryHtml += `<li>${item.name} (${item.size}) - ${formatPHP(item.price)}</li>`;
    });
    summaryHtml += `</ul><div style="margin-top:10px;font-weight:bold;">Total: ${cartTotalPrice.textContent}</div>`;

    // Add Close and Place Order buttons to modal
    summaryHtml += `
        <div style="margin-top:24px;text-align:center;">
            <button id="close-popup" style="margin-right:12px;padding:8px 22px;background:#e74c3c;color:#fff;border:none;border-radius:4px;cursor:pointer;">Close</button>
            <button id="place-order" style="padding:8px 22px;background:#1f7a54;color:#fff;border:none;border-radius:4px;cursor:pointer;">Place Order</button>
        </div>
    `;

    showPopup(summaryHtml);

    document.getElementById('close-popup').onclick = closePopup;
    document.getElementById('place-order').onclick = function() {
        closePopup();
        // Show success message after order is placed
        showPopup(`<h2>Thank you for your order!</h2>
            <p>Your order has been placed successfully. We appreciate your purchase!</p>
            <div style="margin-top:24px;text-align:center;">
                <button id="close-success-popup" style="padding:8px 22px;background:#1f7a54;color:#fff;border:none;border-radius:4px;cursor:pointer;">Close</button>
            </div>`);
        document.getElementById('close-success-popup').onclick = closePopup;
        cart.length = 0; // Empty cart after checkout
        renderCart();
    };
});

/*
    POPUP HANDLING (for checkout modal)
    - showPopup(contentHtml): renders a modal with provided HTML content.
    - closePopup(): removes the popup from the DOM.
*/
function showPopup(contentHtml) {
    let popupBg = document.createElement('div');
    popupBg.id = 'checkout-popup-bg';
    popupBg.style.position = 'fixed';
    popupBg.style.top = 0;
    popupBg.style.left = 0;
    popupBg.style.width = '100vw';
    popupBg.style.height = '100vh';
    popupBg.style.background = 'rgba(0,0,0,0.35)';
    popupBg.style.display = 'flex';
    popupBg.style.alignItems = 'center';
    popupBg.style.justifyContent = 'center';
    popupBg.style.zIndex = 9999;

    let popup = document.createElement('div');
    popup.id = 'checkout-popup';
    popup.style.background = '#fff';
    popup.style.color = '#23233b';
    popup.style.padding = '28px 34px';
    popup.style.borderRadius = '12px';
    popup.style.boxShadow = '0 6px 32px 0 rgba(30,30,50,0.20)';
    popup.style.minWidth = '300px';
    popup.innerHTML = contentHtml;

    popupBg.appendChild(popup);
    document.body.appendChild(popupBg);

    // Allow closing modal by clicking outside popup
    popupBg.addEventListener('click', function(e) {
        if (e.target === popupBg) {
            closePopup();
        }
    });
}

function closePopup() {
    const popupBg = document.getElementById('checkout-popup-bg');
    if (popupBg) popupBg.remove();
}

// ---------------- END SHOP CART FUNCTIONALITY -------------------