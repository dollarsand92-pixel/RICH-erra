// Store cart items
console.log("Script connected");

// Load cart from local storage or start empty
let cart =
JSON.parse(localStorage.getItem("cart")) ||
[];

// Default products if none in local storage
let products =
JSON.parse(localStorage.getItem("products")
) || [
    {
        id: 1,
        name: "Rice Bag",
        price: 120,
        stock: 10,
        image: "images/rice.jpg"
    },
    {
        id: 2,
        name: "Cooking Oil",
        price: 45,
        stock: 50,
        image: "images/oil.jpg"
    },
    {
        id: 3,
        name: "Soap Pack",
        price: 30,
        stock: 200,
        image: "images/soap.jpg"
    }
];

// Save products only if not in local storage(preserves edits)
if (!localStorage.getItem("products")) {
    localStorage.setItem("products",
    JSON.stringify(products));
}

// DOM elements
const cartCount =
document.getElementById("cart-count");
// cart amount
const cartTotal =
document.getElementById("cart-total-amount");
// Drawer total
const cartItems = 
document.getElementById("cart-items");
// Drawer list
const basketTotal =
document.getElementById("cart-total-text");
// Top basket total

//--------------
// Add to cart
//--------------
function addToCart(productId) {
    const product = products.find(p => p.id ===
        productId);
    if (!product || product.stock <= 0)
        return;

        const cartItem = cart.find(i => i.id ===
            productId);
    if (cartItem) {
        cartItem.qty++;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            qty: 1
        });
    }
    product.stock--; // stock reduce here

    renderProducts();
    saveProducts();
    saveCart();
    animatedCart();
    renderCart();
    updateCartUI();
// Auto-open cart drawer(mobile UX)
    const drawer =
    document.getElementById("cartDrawer");
    const overlay =
    document.getElementById("cart-overlay");
    if (drawer && overlay) {
        drawer.classList.add("open");
        overlay.classList.add("show");
        document.body.style.overflow =
        "hidden";
    }
}

//-----------------
// Render Products
//-----------------
function renderProducts(productList = products) {
    const grid =
    document.getElementById("productGrid");
    if (!grid) return;
    
    let html = "";

    productList.forEach(product => {
        const out = p.stock <= 0;
         html +=`
        <div class="product-card ${out ?
            "sold-out" : ""}">
        <img src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>₵${p.price}</p>
        <p class="stock">
        ${out ? "Out of Stock" : "Stock:" +
            p.stock}
            </p>
        <button
        ${out ? "disabled" : ""}
        onclick="addToCart(${p.id})">
        ${out ? "Unavailable" : "Add to Cart"}
        </button>
        </div>
        `;
    });
    grid.innerHTML = html;
}
renderProducts();
//Search products
function searchProducts() {
    const searchValue =
    document.getElementById("searchInput")
    .value.toLowerCase();

    const filteredProducts =
    products.filter(product =>

        product.name.toLowerCase().includes(searchValue)
    );
}
renderProducts(filteredProducts);
//---------------
// Render cart
//---------------
function renderCart() {
    cartItems.innerHTML = "";
let total = 0;

cart.forEach((item, index) => {
    total += item.price * item.qty;

    const li =
    document.createElement("li");
    li.innerHTML = `
    ${item.name} - ₵${item.price} x ${item.qty}
    <button onclick="changeQTY(${index},
    1)">+</button>
    <button onclick="changeQTY(${index},
    -1)">-</button>
    <button onclick="removeItems(${index})">❌</button>
    `;
    cartItems.appendChild(li);
});
// Update cart total
if (cartTotal) cartTotal.textContent =
total;
if (basketTotal) basketTotal.textContent =
`${total}`;
if (cartCount) cartCount.textContent =
cart.reduce((sum, i) => sum + i.qty, 0);
}


function goToCheckout() {
    if (cart.length === 0){
        alert("your cart is empty");
        return;
    }
    window.location.href = "checkout.html";
    }
//--------------------
//whatsapp oder click
//--------------------

//------------------
// Update Cart Badge
//------------------
function updateCartUI() {
    const totalItems = cart.reduce((sum,
        item) => sum + item.qty, 0);
        if (cartCount) cartCount.textContent =
        totalItems;
}
//-----------------------
// CART DRAWER TOGGLE //
//-----------------------
function toggleCart() {
    const drawer =
    document.getElementById("cartDrawer");
    const overlay =
    document.getElementById("cart-overlay");

    drawer.classList.toggle("open");
    overlay.classList.toggle("show");

    // lock body scroll (mobile UX win)
    document.body.style.overflow =
    drawer.classList.contains("open") ?
    "hidden" : "auto";
}
//------------------
// Change quantity
//------------------
function changeQTY(index, change) {
    const item = cart[index];
    if (!item) return;
    const product = products.find(p => p.id === item.id);

    if (!product) return;
    if (change > 0 && product.stock <= 0) return
    item.qty += change;

    if (change > 0) product.stock--;
    if (change < 0) product.stock++;

    if (item.qty <= 0) {
        cart.splice(index, 1);
    }
    saveProducts();
    saveCart();
    renderProducts();
    renderCart();
    updateCartUI();
}

//--------------
// Remove item
//--------------
function removeItems(index) {
    const item = cart[index];
    const product = products.find(p => p.id
        === item.id);

        if (product) {
            product.stock += item.qty;
        }

    cart.splice(index, 1);
    saveProducts();
    saveCart();
    renderProducts();
    renderCart();
    updateCartUI();
}


//----------------
// Admin Panel
//-----------------------
let adminUnlock = false;

function renderAdmin() {
    const panel =
document.getElementById("admin-panel");
const adminProducts =
document.getElementById("adminProducts");

    if (!adminUnlock) {
        const password = prompt("Enter admin password")
        if (password !== 'allffa123') {
            alert("Acess denied");return
        }
        adminUnlock = true;
    }

    // Toggle panel
    panel.style.display =
    panel.style.display === "block" ?
    "none" : "block";

    adminProducts.innerHTML = "";
    
    products.forEach((p, index) => {
        adminProducts.innerHTML +=`
        <div style="margin-bottom: 10px;">
        <input value="${p.name}"
        onchange="updateName(${index}, this.value)">
        <input type="number" value="${p.price}"
        onchange="updatePrice(${index}, this.value)">
        <input type="number" value="${p.stock}"
        onchange="updateStock(${index}, this.value)">
        </div>
        `;
    });
}

function updatePrice(index, value) {
    products[index].price = Number(value);
    saveProducts();
}

function updateName(index, value) {
    products[index].name = value;
    saveProducts();
}

function saveProducts() {
    localStorage.setItem("products",
        JSON.stringify(products)
    );
}

function updateStock(index, value) {
    products[index].stock = Number(value);
    saveProducts();
    renderProducts();
}

function addProduct() {
    const name =
    document.getElementById("admin-name").value;

    const price =
    parseFloat(document.getElementById("admin-price").value);
    const stock =
    parseInt(document.getElementById("admin-stock").value);
    const imageInput =
    document.getElementById("admin-image");

    if(!name || !price || !stock || !imageInput.files[0]) {
        alert("Please fill all fields");
        return;
    }

    const reader = new FileReader();

    reader.onload = function () {
        const newProduct = {
            id: Date.now(),
            name: name,
            price: price,
            stock: stock,
            image: reader.result,
        };

        products.push(newProduct);
        localStorage.setItem("products",
            JSON.stringify(products));

            renderProducts();
            renderAdmin();

            alert("Product added successfully!");

            // Clear fields

            document.getElementById("admin-name").value = "";
            document.getElementById("admin-price").value = "";
            document.getElementById("admin-stock").value = "";
            document.getElementById("admin-image").value = "";
        };
        reader.readAsDataURL(imageInput.files[0])
    }

    function renderAdminProducts() {
        const container =
        document.getElementById("adminProducts");
        container.innerHTML = "";

        products.forEach(product => {
            container.innerHTML += `
            <div style="margin-bottom:10px;">
            <strong>${product.name}</strong> -
            ₵${product.price} | Stock: ${product.stock}
            </div>
            `;
        });
    }

//---------------
// Animated Cart
//---------------
function animatedCart() {
    const basket = 
document.querySelector(".basket");
if (!basket) return;

basket.classList.add("shake");
setTimeout(() => {
    basket.classList.remove("shake");
}, 300);
}

//----------------------------
//Service Worker Registration
//----------------------------
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js")
    .then(() =>
        console.log("ServiceWorker registered"))
        .catch(err => console.log("SW failed", err));
    }

//---------------------------
// Save cart to local storage
//---------------------------
function saveCart() {
    localStorage.setItem("cart",
JSON.stringify(cart));
}

//----------------------
// Load cart on refresh
//-----------------------
updateCartUI();
renderCart();