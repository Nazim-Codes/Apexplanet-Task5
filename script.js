// FreshCart uses only plain JavaScript, so it is easy to understand and edit.

// Every product has an id, name, price, category, and emoji image.
const products = [
  { id: 1, name: "Red Apples", price: 120, category: "Fruits", emoji: "🍎" },
  { id: 2, name: "Sweet Bananas", price: 50, category: "Fruits", emoji: "🍌" },
  { id: 3, name: "Fresh Carrots", price: 45, category: "Vegetables", emoji: "🥕" },
  { id: 4, name: "Green Broccoli", price: 70, category: "Vegetables", emoji: "🥦" },
  { id: 5, name: "Sourdough Bread", price: 85, category: "Bakery", emoji: "🍞" },
  { id: 6, name: "Chocolate Muffin", price: 65, category: "Bakery", emoji: "🧁" },
  { id: 7, name: "Orange Juice", price: 95, category: "Drinks", emoji: "🧃" },
  { id: 8, name: "Cold Coffee", price: 110, category: "Drinks", emoji: "🥤" }
];

// Get the elements that JavaScript will update.
const productList = document.getElementById("product-list");
const searchInput = document.getElementById("search-input");
const filterButtons = document.querySelectorAll(".filter");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");
const cartEmpty = document.getElementById("cart-empty");
const emptyMessage = document.getElementById("empty-message");
const cartPanel = document.getElementById("cart-panel");
const overlay = document.getElementById("overlay");
const checkoutButton = document.getElementById("checkout-button");
const toast = document.getElementById("toast");

let selectedCategory = "All";
let cart = JSON.parse(localStorage.getItem("freshCartItems")) || [];

// This function changes a number into Indian rupee price text.
function formatPrice(price) {
  return `₹${price.toFixed(2)}`;
}

// Show product cards that match the selected category and search text.
function displayProducts() {
  const searchText = searchInput.value.toLowerCase();

  const visibleProducts = products.filter(function (product) {
    const categoryMatches = selectedCategory === "All" || product.category === selectedCategory;
    const nameMatches = product.name.toLowerCase().includes(searchText);
    return categoryMatches && nameMatches;
  });

  productList.innerHTML = "";

  visibleProducts.forEach(function (product) {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-image">${product.emoji}</div>
      <div class="product-info">
        <span class="category">${product.category}</span>
        <h3>${product.name}</h3>
        <div class="product-bottom">
          <strong>${formatPrice(product.price)}</strong>
          <button class="add-button" type="button" data-id="${product.id}">Add to cart</button>
        </div>
      </div>
    `;
    productList.appendChild(card);
  });

  emptyMessage.classList.toggle("hidden", visibleProducts.length > 0);
}

// Add a product to the cart. If it is already in the cart, increase its quantity.
function addToCart(productId) {
  const product = products.find(function (item) {
    return item.id === productId;
  });

  const itemInCart = cart.find(function (item) {
    return item.id === productId;
  });

  if (itemInCart) {
    itemInCart.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCart();
  showToast(`${product.name} added to cart`);
}

// Increase, decrease, or remove an item in the cart.
function changeQuantity(productId, change) {
  const item = cart.find(function (cartItem) {
    return cartItem.id === productId;
  });

  item.quantity += change;

  if (item.quantity === 0) {
    cart = cart.filter(function (cartItem) {
      return cartItem.id !== productId;
    });
  }

  updateCart();
}

function removeFromCart(productId) {
  cart = cart.filter(function (item) {
    return item.id !== productId;
  });
  updateCart();
}

// Update the cart panel and save the cart in localStorage.
function updateCart() {
  cartItems.innerHTML = "";
  let numberOfItems = 0;
  let total = 0;

  cart.forEach(function (item) {
    numberOfItems += item.quantity;
    total += item.price * item.quantity;

    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.innerHTML = `
      <div class="cart-item-emoji">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-title">
          <strong>${item.name}</strong>
          <button class="remove-button" type="button" data-remove="${item.id}">Remove</button>
        </div>
        <span>${formatPrice(item.price)}</span>
        <div class="quantity-controls">
          <button type="button" data-change="-1" data-id="${item.id}" aria-label="Decrease quantity">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-change="1" data-id="${item.id}" aria-label="Increase quantity">+</button>
        </div>
      </div>
    `;
    cartItems.appendChild(cartItem);
  });

  cartCount.textContent = numberOfItems;
  cartTotal.textContent = formatPrice(total);
  cartEmpty.classList.toggle("hidden", cart.length > 0);
  checkoutButton.disabled = cart.length === 0;
  localStorage.setItem("freshCartItems", JSON.stringify(cart));
}

function openCart() {
  cartPanel.classList.add("open");
  overlay.classList.add("show");
  cartPanel.setAttribute("aria-hidden", "false");
}

function closeCart() {
  cartPanel.classList.remove("open");
  overlay.classList.remove("show");
  cartPanel.setAttribute("aria-hidden", "true");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(function () {
    toast.classList.remove("show");
  }, 2200);
}

// Filter buttons select a category.
filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    selectedCategory = button.dataset.category;

    filterButtons.forEach(function (filter) {
      filter.classList.remove("active");
    });

    button.classList.add("active");
    displayProducts();
  });
});

// Search changes the product cards while the user types.
searchInput.addEventListener("input", displayProducts);

// Product cards use event delegation for their Add to cart buttons.
productList.addEventListener("click", function (event) {
  if (event.target.classList.contains("add-button")) {
    addToCart(Number(event.target.dataset.id));
  }
});

// Cart buttons also use event delegation because the cart is redrawn often.
cartItems.addEventListener("click", function (event) {
  if (event.target.dataset.change) {
    changeQuantity(Number(event.target.dataset.id), Number(event.target.dataset.change));
  }

  if (event.target.dataset.remove) {
    removeFromCart(Number(event.target.dataset.remove));
  }
});

document.getElementById("open-cart").addEventListener("click", openCart);
document.getElementById("close-cart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

checkoutButton.addEventListener("click", function () {
  const itemCount = cart.reduce(function (total, item) {
    return total + item.quantity;
  }, 0);

  showToast(`Order placed for ${itemCount} item(s). Thank you!`);
  cart = [];
  updateCart();
  closeCart();
});

// Show the first page and any cart saved from an earlier visit.
displayProducts();
updateCart();
