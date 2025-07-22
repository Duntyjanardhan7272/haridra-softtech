
    // Functions for login, registration, cart, etc.

let users = JSON.parse(localStorage.getItem('fashionhubUsers')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let cart = JSON.parse(localStorage.getItem('fashionhubCart')) || [];
let orders = JSON.parse(localStorage.getItem('fashionhubOrders')) || [];
let addresses = JSON.parse(localStorage.getItem('fashionhubAddresses')) || [];

// Sample orders data for demo
if (orders.length === 0 && currentUser) {
    orders = [
        {
            id: 'ORD-' + Date.now().toString().slice(-6),
            date: new Date().toISOString().split('T')[0],
            items: [
                { name: "Men's Casual Shirt", price: 999, quantity: 1, size: "M" }
            ],
            total: 999,
            status: 'completed',
            userId: currentUser.id
        },
        {
            id: 'ORD-' + (Date.now() - 1000000).toString().slice(-6),
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            items: [
                { name: "Women's Summer Dress", price: 1799, quantity: 1, size: "M" },
                { name: "Women's Silk Scarf", price: 1199, quantity: 2 }
            ],
            total: 4197,
            status: 'pending',
            userId: currentUser.id
        }
    ];
    localStorage.setItem('fashionhubOrders', JSON.stringify(orders));
}

// Sample address data for demo
if (addresses.length === 0 && currentUser) {
    addresses = [
        {
            id: '1',
            type: 'home',
            street: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            zip: '400001',
            country: 'India',
            isDefault: true,
            userId: currentUser.id
        },
        {
            id: '2',
            type: 'work',
            street: '456 Business Avenue',
            city: 'Mumbai',
            state: 'Maharashtra',
            zip: '400002',
            country: 'India',
            isDefault: false,
            userId: currentUser.id
        }
    ];
    localStorage.setItem('fashionhubAddresses', JSON.stringify(addresses));
}

// DOM elements
const modal = document.getElementById('authModal');
const loginBtn = document.getElementById('loginBtn');
const closeModal = document.getElementById('closeModal');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authNavItem = document.getElementById('authNavItem');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const cartLink = document.getElementById('cartLink');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const cartCount = document.getElementById('cartCount');
const profileSidebar = document.getElementById('profileSidebar');
const closeProfile = document.getElementById('closeProfile');
const userAvatar = document.getElementById('userAvatar');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const ordersCount = document.getElementById('ordersCount');
const cartItemsCount = document.getElementById('cartItemsCount');
const orderHistory = document.getElementById('orderHistory');
const fullOrderHistory = document.getElementById('fullOrderHistory');
const addressList = document.getElementById('addressList');
const addAddressBtn = document.getElementById('addAddressBtn');
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const profilePhone = document.getElementById('profilePhone');
const profileDob = document.getElementById('profileDob');
const profileForm = document.getElementById('profileForm');
const settingsForm = document.getElementById('settingsForm');
const profileSuccessMsg = document.getElementById('profileSuccessMsg');
const settingsSuccessMsg = document.getElementById('settingsSuccessMsg');

// Function to show dashboard section
function showDashboardSection() {
    // Hide all sections
    document.querySelectorAll('.dashboard-content').forEach(section => {
        section.classList.remove('active');
    });

    // Show dashboard section
    document.getElementById('dashboardSection').classList.add('active');

    // Update menu active state
    document.querySelectorAll('.profile-menu a').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector('.profile-menu a[data-section="dashboard"]').classList.add('active');
}

// Function to close all dashboard sections
function closeAllDashboardSections() {
    document.querySelectorAll('.dashboard-content').forEach(section => {
        section.classList.remove('active');
    });
}

// Update UI based on login state
function updateAuthUI() {
    if (currentUser) {
        authNavItem.innerHTML = `
              <div class="user-profile">
                  <span>${currentUser.name.split(' ')[0]}</span>
                  <div class="profile-dropdown">
                      <a href="#" id="profileLink">My Profile</a>
                      <div class="divider"></div>
                      <button class="logout-btn" id="logoutBtn">Logout</button>
                  </div>
              </div>
          `;
        document.getElementById('logoutBtn').addEventListener('click', logout);
        document.getElementById('profileLink').addEventListener('click', (e) => {
            e.preventDefault();
            openProfileSidebar();
            showDashboardSection();
        });
    } else {
        authNavItem.innerHTML = '<button class="login-btn" id="loginBtn">Login</button>';
        document.getElementById('loginBtn').addEventListener('click', () => {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }
}

// Function to update cart count in header
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = count;
    cartItemsCount.textContent = count;
    localStorage.setItem('fashionhubCart', JSON.stringify(cart));
}

// Function to show cart notification
function showCartNotification(message = 'Product added to cart!', type = 'success') {
    const notification = document.getElementById('cartNotification');
    notification.textContent = '';
    notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i> ${message}`;

    notification.className = `popup-message popup-${type}`;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Function to render cart items
function renderCartItems() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        cartTotal.textContent = 'Total: ₹0';
        return;
    }

    cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price * item.quantity;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
              <img src="${item.image}" alt="${item.name}">
              <div class="cart-item-details">
                  <div class="cart-item-title">${item.name}</div>
                  ${item.size ? `<div class="cart-item-size">Size: ${item.size}</div>` : ''}
                  <div class="cart-item-price">
    ${item.originalPrice ? `<span class="original-price">₹${item.originalPrice}</span>` : ''}
    ₹${item.price}
  </div>
  
                  <div class="cart-item-quantity">
                      <button class="quantity-btn minus" data-index="${index}">-</button>
                      <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-index="${index}">
                      <button class="quantity-btn plus" data-index="${index}">+</button>
                  </div>
                  <button class="remove-item" data-index="${index}">Remove</button>
              </div>
          `;
        cartItemsContainer.appendChild(cartItem);
    });

    cartTotal.textContent = `Total: ₹${total}`;

    // Add event listeners to quantity buttons
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            if (cart[index].quantity > 1) {
                cart[index].quantity--;
                renderCartItems();
                updateCartCount();
            }
        });
    });

    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            cart[index].quantity++;
            renderCartItems();
            updateCartCount();
        });
    });

    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const index = e.target.getAttribute('data-index');
            const newQuantity = parseInt(e.target.value);
            if (newQuantity > 0) {
                cart[index].quantity = newQuantity;
                renderCartItems();
                updateCartCount();
            } else {
                e.target.value = cart[index].quantity;
            }
        });
    });

    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            cart.splice(index, 1);
            renderCartItems();
            updateCartCount();
        });
    });
}

// Open profile sidebar
function openProfileSidebar() {
    profileSidebar.classList.add('open');
    document.body.classList.add('profile-open');
    updateProfileInfo();
    renderOrderHistory();
    renderFullOrderHistory();
    renderAddressList();

    // Store current scroll position
    const scrollY = window.scrollY;
    document.body.style.top = `-${scrollY}px`;
    document.body.dataset.scrollY = scrollY;
}

// Close profile sidebar
function closeProfileSidebar() {
    profileSidebar.classList.remove('open');
    document.body.classList.remove('profile-open');
    closeAllDashboardSections();

    // Restore scroll position
    const scrollY = document.body.dataset.scrollY;
    if (scrollY) {
        window.scrollTo(0, scrollY);
        document.body.style.top = '';
        delete document.body.dataset.scrollY;
    }
}

// Update profile information
function updateProfileInfo() {
    if (currentUser) {
        // Generate avatar based on name if not exists
        if (!currentUser.avatar) {
            currentUser.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=e74c3c&color=fff`;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }

        userAvatar.src = currentUser.avatar;
        userName.textContent = currentUser.name;
        userEmail.textContent = currentUser.email;
        ordersCount.textContent = orders.filter(order => order.userId === currentUser.id).length;

        // Update profile form
        if (profileName) profileName.value = currentUser.name;
        if (profileEmail) profileEmail.value = currentUser.email;
        if (profilePhone) profilePhone.value = currentUser.phone || '';
        if (profileDob) profileDob.value = currentUser.dob || '';
    }
}

// Render order history
function renderOrderHistory() {
    orderHistory.innerHTML = '';
    const userOrders = orders.filter(order => order.userId === currentUser.id).slice(0, 3);

    if (userOrders.length === 0) {
        orderHistory.innerHTML = '<tr><td colspan="4" style="text-align: center;">No orders found</td></tr>';
        return;
    }

    userOrders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
              <td>${order.id}</td>
              <td>${order.date}</td>
              <td>₹${order.total}</td>
              <td><span class="order-status status-${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></td>
          `;
        orderHistory.appendChild(row);
    });
}

// Render full order history
function renderFullOrderHistory() {
    fullOrderHistory.innerHTML = '';
    const userOrders = orders.filter(order => order.userId === currentUser.id);

    if (userOrders.length === 0) {
        fullOrderHistory.innerHTML = '<tr><td colspan="6" style="text-align: center;">No orders found</td></tr>';
        return;
    }

    userOrders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
              <td>${order.id}</td>
              <td>${order.date}</td>
              <td>${order.items.length}</td>
              <td>₹${order.total}</td>
              <td><span class="order-status status-${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></td>
              <td><a href="#" class="view-order">View</a></td>
          `;
        fullOrderHistory.appendChild(row);
    });
}

// Render address list
function renderAddressList() {
    addressList.innerHTML = '';
    const userAddresses = addresses.filter(addr => addr.userId === currentUser.id);

    userAddresses.forEach(address => {
        const addressCard = document.createElement('div');
        addressCard.className = 'address-card';
        addressCard.innerHTML = `
            <h4>${address.type} Address</h4>
            <p>${address.street}</p>
            <p>${address.city}, ${address.state} ${address.zip}</p>
            <button onclick="editAddress('${address.id}')">Edit</button>
            <button onclick="deleteAddress('${address.id}')">Delete</button>
        `;
        addressList.appendChild(addressCard);
    });
}




// Function to edit address
function editAddress(id) {
    const address = addresses.find(addr => addr.id === id);
    if (!address) return;

    // Create a modal for editing address
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.style.zIndex = '1001';

    modal.innerHTML = `
          <div class="modal-content" style="max-width: 500px;">
              <div class="modal-header">
                  <h2>Edit Address</h2>
                  <button class="close-btn" id="closeAddressModal">&times;</button>
              </div>
              <div style="padding: 1.5rem;">
                  <form id="addressForm">
                      <input type="hidden" id="addressId" value="${address.id}">
                      <div class="form-group">
                          <label for="addressType">Address Type</label>
                          <select id="addressType" class="form-control" required>
                              <option value="home" ${address.type === 'home' ? 'selected' : ''}>Home</option>
                              <option value="work" ${address.type === 'work' ? 'selected' : ''}>Work</option>
                              <option value="other" ${address.type === 'other' ? 'selected' : ''}>Other</option>
                          </select>
                      </div>
                      <div class="form-group">
                          <label for="street">Street Address</label>
                          <input type="text" id="street" class="form-control" value="${address.street}" required>
                      </div>
                      <div class="form-row">
                          <div class="form-col">
                              <label for="city">City</label>
                              <input type="text" id="city" class="form-control" value="${address.city}" required>
                          </div>
                          <div class="form-col">
                              <label for="state">State</label>
                              <input type="text" id="state" class="form-control" value="${address.state}" required>
                          </div>
                      </div>
                      <div class="form-row">
                          <div class="form-col">
                              <label for="zip">ZIP Code</label>
                              <input type="text" id="zip" class="form-control" value="${address.zip}" required>
                          </div>
                          <div class="form-col">
                              <label for="country">Country</label>
                              <input type="text" id="country" class="form-control" value="${address.country}" required>
                          </div>
                      </div>
                      <div class="form-group">
                          <label>
                              <input type="checkbox" id="isDefault" ${address.isDefault ? 'checked' : ''}> Set as default address
                          </label>
                      </div>
                      <button type="submit" class="save-btn">Save Address</button>
                  </form>
              </div>
          </div>
      `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Close modal
    document.getElementById('closeAddressModal').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.body.style.overflow = 'auto';
    });

    // Handle form submission
    document.getElementById('addressForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const updatedAddress = {
            id: document.getElementById('addressId').value,
            type: document.getElementById('addressType').value,
            street: document.getElementById('street').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            zip: document.getElementById('zip').value,
            country: document.getElementById('country').value,
            isDefault: document.getElementById('isDefault').checked,
            userId: currentUser.id
        };

        // If setting as default, unset other defaults
        if (updatedAddress.isDefault) {
            addresses.forEach(addr => {
                if (addr.userId === currentUser.id) {
                    addr.isDefault = false;
                }
            });
        }

        // Update the address
        const index = addresses.findIndex(addr => addr.id === updatedAddress.id);
        if (index !== -1) {
            addresses[index] = updatedAddress;
            localStorage.setItem('fashionhubAddresses', JSON.stringify(addresses));
            renderAddressList();
        }

        document.body.removeChild(modal);
        document.body.style.overflow = 'auto';
    });
}

// Function to delete address
function deleteAddress(id) {
    if (confirm('Are you sure you want to delete this address?')) {
        addresses = addresses.filter(addr => addr.id !== id);
        localStorage.setItem('fashionhubAddresses', JSON.stringify(addresses));
        renderAddressList();
    }
}

// Function to add new address
function addNewAddress() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.style.zIndex = '1001';

    modal.innerHTML = `
          <div class="modal-content" style="max-width: 500px;">
              <div class="modal-header">
                  <h2>Add New Address</h2>
                  <button class="close-btn" id="closeNewAddressModal">&times;</button>
              </div>
              <div style="padding: 1.5rem;">
                  <form id="newAddressForm">
                      <div class="form-group">
                          <label for="newAddressType">Address Type</label>
                          <select id="newAddressType" class="form-control" required>
                              <option value="home">Home</option>
                              <option value="work">Work</option>
                              <option value="other">Other</option>
                          </select>
                      </div>
                      <div class="form-group">
                          <label for="newStreet">Street Address</label>
                          <input type="text" id="newStreet" class="form-control" required>
                      </div>
                      <div class="form-row">
                          <div class="form-col">
                              <label for="newCity">City</label>
                              <input type="text" id="newCity" class="form-control" required>
                          </div>
                          <div class="form-col">
                              <label for="newState">State</label>
                              <input type="text" id="newState" class="form-control" required>
                          </div>
                      </div>
                      <div class="form-row">
                          <div class="form-col">
                              <label for="newZip">ZIP Code</label>
                              <input type="text" id="newZip" class="form-control" required>
                          </div>
                          <div class="form-col">
                              <label for="newCountry">Country</label>
                              <input type="text" id="newCountry" class="form-control" value="India" required>
                          </div>
                      </div>
                      <div class="form-group">
                          <label>
                              <input type="checkbox" id="newIsDefault"> Set as default address
                          </label>
                      </div>
                      <button type="submit" class="save-btn">Save Address</button>
                  </form>
              </div>
          </div>
      `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Close modal
    document.getElementById('closeNewAddressModal').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.body.style.overflow = 'auto';
    });

    // Handle form submission
    document.getElementById('newAddressForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const newAddress = {
            id: Date.now().toString(),
            type: document.getElementById('newAddressType').value,
            street: document.getElementById('newStreet').value,
            city: document.getElementById('newCity').value,
            state: document.getElementById('newState').value,
            zip: document.getElementById('newZip').value,
            country: document.getElementById('newCountry').value,
            isDefault: document.getElementById('newIsDefault').checked,
            userId: currentUser.id
        };

        // If setting as default, unset other defaults
        if (newAddress.isDefault) {
            addresses.forEach(addr => {
                if (addr.userId === currentUser.id) {
                    addr.isDefault = false;
                }
            });
        }

        addresses.push(newAddress);
        localStorage.setItem('fashionhubAddresses', JSON.stringify(addresses));
        renderAddressList();

        document.body.removeChild(modal);
        document.body.style.overflow = 'auto';
    });
}

// Login function
function login(email, password) {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateAuthUI();
        closeModal.click();
        return true;
    }
    return false;
}

// Register function
function register(name, email, password) {
    // Check if user already exists
    if (users.some(u => u.email === email)) {
        return false;
    }

    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        phone: '',
        dob: '',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e74c3c&color=fff`
    };

    users.push(newUser);
    localStorage.setItem('fashionhubUsers', JSON.stringify(users));

    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateAuthUI();
    closeModal.click();
    return true;
}

// Logout function
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthUI();
    closeProfileSidebar();
}

// Open cart sidebar
function openCartSidebar() {
    cartSidebar.classList.add('open');
    document.body.classList.add('cart-open');
    renderCartItems();

    // Store current scroll position
    const scrollY = window.scrollY;
    document.body.style.top = `-${scrollY}px`;
    document.body.dataset.scrollY = scrollY;
}

function closeCartSidebar() {
    cartSidebar.classList.remove('open');
    document.body.classList.remove('cart-open');

    // Reset body styles
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';

    // Restore scroll position
    const scrollY = document.body.dataset.scrollY;
    if (scrollY) {
        window.scrollTo(0, scrollY);
        delete document.body.dataset.scrollY;
    }
}

function closeProfileSidebar() {
    profileSidebar.classList.remove('open');
    document.body.classList.remove('profile-open');
    closeAllDashboardSections();

    // Reset body styles
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';

    // Restore scroll position
    const scrollY = document.body.dataset.scrollY;
    if (scrollY) {
        window.scrollTo(0, scrollY);
        delete document.body.dataset.scrollY;
    }
}

// Enhanced Add to cart function with button animations
function addToCart(product, buttonElement = null) {
    // Animate button if provided
    if (buttonElement) {
        animateAddToCartButton(buttonElement);
    }

    // Check if product already exists in cart
    const existingItem = cart.find(item =>
        item.id === product.id &&
        (!product.size || item.size === product.size)
    );

    if (existingItem) {
        existingItem.quantity += product.quantity || 1;
    } else {
        cart.push({
            ...product,
            quantity: product.quantity || 1
        });
    }

    updateCartCount();
    showCartNotification();
    renderCartItems();
}

// Enhanced button animation function
function animateAddToCartButton(button) {
    // Prevent multiple clicks during animation
    if (button.classList.contains('loading') || button.classList.contains('success')) {
        return;
    }
    
    // Add clicked class for bounce animation
    button.classList.add('clicked');
    
    // Show loading state
    const originalText = button.innerHTML;
    button.classList.add('loading');
    button.disabled = true;
    
    // After loading animation, show success state
    setTimeout(() => {
        button.classList.remove('loading');
        button.classList.add('success');
        
        // Reset button after success animation
        setTimeout(() => {
            button.classList.remove('success', 'clicked');
            button.innerHTML = originalText;
            button.disabled = false;
        }, 1500);
    }, 800);
}

// Utility function to initialize button animations for dynamically added buttons
function initializeButtonAnimations() {
    document.querySelectorAll('.add-to-cart, .add-to-cart-btn').forEach(button => {
        // Remove any existing event listeners to prevent duplicates
        button.removeEventListener('click', handleAddToCartClick);
        button.addEventListener('click', handleAddToCartClick);
    });
}

// Centralized click handler for add to cart buttons
function handleAddToCartClick(e) {
    const button = e.target;
    const productId = parseInt(button.getAttribute('data-id'));
    
    if (productId) {
        // Find product from the products array
        const product = products.find(p => p.id === productId);
        if (product) {
            addToCart(product, button);
        }
    } else {
        // Handle legacy product card structure
        const productCard = button.closest('.product-card');
        if (productCard) {
            const product = {
                id: Date.now().toString(),
                name: productCard.querySelector('h3').textContent,
                price: parseInt(productCard.querySelector('.price').textContent.replace(/[^0-9]/g, '')),
                image: productCard.querySelector('img').src,
                size: productCard.querySelector('.size-option.selected')?.textContent
            };
            addToCart(product, button);
        }
    }
}

// Checkout function
function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    if (!currentUser) {
        alert('Please login to proceed to checkout');
        loginBtn.click();
        return;
    }

    // Create new order
    const newOrder = {
        id: 'ORD-' + Date.now().toString().slice(-6),
        date: new Date().toISOString().split('T')[0],
        items: [...cart],
        total: cart.reduce((total, item) => total + (item.price * item.quantity), 0),
        status: 'pending',
        userId: currentUser.id
    };



    orders.push(newOrder);
    localStorage.setItem('fashionhubOrders', JSON.stringify(orders));

    // Clear cart
    cart = [];
    localStorage.setItem('fashionhubCart', JSON.stringify(cart));

    // Update UI
    updateCartCount();
    renderCartItems();
    closeCartSidebar();

    // Show success message
    alert(`Order #${newOrder.id} placed successfully! Total: ₹${newOrder.total}`);

    // Update profile info if open
    if (profileSidebar.classList.contains('open')) {
        updateProfileInfo();
        renderOrderHistory();
        renderFullOrderHistory();
    }
}


// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    updateCartCount();

    // Login/Register modal
    loginBtn?.addEventListener('click', () => {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    showRegister.addEventListener('click', () => {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });

    showLogin.addEventListener('click', () => {
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    });

    // Login form submission
    document.getElementById('login').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (login(email, password)) {
            // Success
        } else {
            document.getElementById('loginPasswordError').textContent = 'Invalid email or password';
            document.getElementById('loginPasswordError').style.display = 'block';
        }
    });

    // Register form submission
    document.getElementById('register').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;

        // Reset error messages
        document.querySelectorAll('.error-message').forEach(el => {
            el.style.display = 'none';
        });

        // Validate
        let valid = true;

        if (password !== confirmPassword) {
            document.getElementById('regConfirmPasswordError').textContent = 'Passwords do not match';
            document.getElementById('regConfirmPasswordError').style.display = 'block';
            valid = false;
        }

        if (password.length < 6) {
            document.getElementById('regPasswordError').textContent = 'Password must be at least 6 characters';
            document.getElementById('regPasswordError').style.display = 'block';
            valid = false;
        }

        if (valid) {
            if (register(name, email, password)) {
                // Success
            } else {
                document.getElementById('regEmailError').textContent = 'Email already registered';
                document.getElementById('regEmailError').style.display = 'block';
            }
        }
    });

    // Cart functionality
    cartLink.addEventListener('click', (e) => {
        e.preventDefault();
        openCartSidebar();
    });

    closeCart.addEventListener('click', closeCartSidebar);

    checkoutBtn.addEventListener('click', checkout);

    // Profile functionality
    closeProfile.addEventListener('click', closeProfileSidebar);

    // Profile menu navigation
    document.querySelectorAll('.profile-menu a').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');

            // Update active menu item
            document.querySelectorAll('.profile-menu a').forEach(i => {
                i.classList.remove('active');
            });
            item.classList.add('active');

            // Show corresponding section
            closeAllDashboardSections();
            document.getElementById(`${section}Section`).classList.add('active');
        });
    });

    // Profile form submission
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Update user info
            currentUser.name = profileName.value;
            currentUser.email = profileEmail.value;
            currentUser.phone = profilePhone.value;
            currentUser.dob = profileDob.value;

            // Update in users array
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex] = currentUser;
            }
            // Persist changes
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('fashionhubUsers', JSON.stringify(users));

            // Save to localStorage
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('fashionhubUsers', JSON.stringify(users));

            // Update UI
            userName.textContent = currentUser.name;
            userEmail.textContent = currentUser.email;

            // Show success message
            profileSuccessMsg.textContent = 'Profile updated successfully!';
            profileSuccessMsg.style.display = 'block';
            setTimeout(() => {
                profileSuccessMsg.style.display = 'none';
            }, 3000);
        });
    }

    // Settings form submission
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // In a real app, you would handle password change here
            // For demo, we'll just show a success message

            settingsSuccessMsg.textContent = 'Settings updated successfully!';
            settingsSuccessMsg.style.display = 'block';
            setTimeout(() => {
                settingsSuccessMsg.style.display = 'none';
            }, 3000);
        });
    }

    // Add address button
    if (addAddressBtn) {
        addAddressBtn.addEventListener('click', addNewAddress);
    }

    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            const product = {
                id: Date.now().toString(), // In a real app, this would be a proper product ID
                name: productCard.querySelector('h3').textContent,
                price: parseInt(productCard.querySelector('.price').textContent.replace(/[^0-9]/g, '')),
                image: productCard.querySelector('img').src,
                size: productCard.querySelector('.size-option.selected')?.textContent
            };

            addToCart(product, e.target);
        });
    });

    // Size selector
    document.querySelectorAll('.size-option').forEach(option => {
        option.addEventListener('click', (e) => {
            const selector = e.target.closest('.size-selector');
            selector.querySelectorAll('.size-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            e.target.classList.add('selected');
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
});

// Make functions available globally for HTML onclick attributes
window.editAddress = editAddress;
window.deleteAddress = deleteAddress;
window.showDashboardSection = showDashboardSection;

// Address Validation Function
function validateAddressForm(form) {
    const zipPattern = /^\d{6}$/;
    const requiredFields = ['street', 'city', 'state', 'zip', 'country'];

    for (let field of requiredFields) {
        const input = form.querySelector(`[id*="${field}"]`);
        if (!input || input.value.trim() === '') {
            alert(`Please enter a valid ${field}`);
            return false;
        }
        if (field === 'zip' && !zipPattern.test(input.value)) {
            alert("Please enter a valid 6-digit ZIP code.");
            return false;
        }
    }
    return true;
}

// Attach validation to add/edit address forms
function attachAddressValidation() {
    document.querySelectorAll("form[id$='AddressForm']").forEach(form => {
        form.addEventListener("submit", function (e) {
            if (!validateAddressForm(form)) {
                e.preventDefault();
            }
        });
    });
}

// Razorpay Payment Integration
function initiatePayment(order) {
    const options = {
        key: "rzp_test_YourRazorpayKey", // Replace with your actual key
        amount: order.total * 100,
        currency: "INR",
        name: "Haridra Softtech FashionHub",
        description: "Order Payment",
        handler: function (response) {
            // Verify payment on your server in a real application
            finalizeOrder(order);

            // Redirect to thank you page with order ID
            window.location.href = `thank-you.html?order=${order.id}`;
        },
        prefill: {
            name: currentUser?.name || '',
            email: currentUser?.email || '',
            contact: currentUser?.phone || ''
        },
        theme: {
            color: "#e74c3c"
        },
        modal: {
            ondismiss: function () {
                // Optional: Handle when user closes the payment modal
                console.log("Payment modal closed");
            }
        }
    };

    const rzp = new Razorpay(options);
    rzp.open();
}

function checkout() {
    if (cart.length === 0) {
        showCartNotification('Your cart is empty!', 'error');
        return;
    }

    if (!currentUser) {
        showCartNotification('Please login to proceed to checkout', 'error');
        loginBtn.click();
        return;
    }

    // Check if user has any saved addresses
    const userAddresses = addresses.filter(addr => addr.userId === currentUser.id);

    if (userAddresses.length === 0) {
        // No addresses - prompt to add one
        showCartNotification('Please add a shipping address first', 'error');
        openProfileSidebar();
        document.querySelector('.profile-menu a[data-section="address"]').click();
        return;
    }

    // Create address selection modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.style.zIndex = '1001';

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2>Select Delivery Address</h2>
                <button class="close-btn" id="closeAddressModal">&times;</button>
            </div>
            <div style="padding: 1.5rem;">
                <div id="checkoutAddressList" style="margin-bottom: 1.5rem;"></div>
                <button class="btn" id="addNewAddressBtn" style="margin-bottom: 1.5rem;">Add New Address</button>
                <button class="checkout-btn" id="confirmCheckoutBtn">Proceed to Payment</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Render address options
    const addressList = document.getElementById('checkoutAddressList');
    userAddresses.forEach(address => {
        const addressCard = document.createElement('div');
        addressCard.className = 'address-card';
        addressCard.style.marginBottom = '1rem';
        addressCard.style.padding = '1rem';
        addressCard.style.border = '1px solid #eee';
        addressCard.style.borderRadius = '8px';
        addressCard.style.cursor = 'pointer';
        addressCard.style.transition = 'all 0.2s';

        addressCard.innerHTML = `
            <h4 style="margin-top: 0; color: var(--primary-color);">
                ${address.type.charAt(0).toUpperCase() + address.type.slice(1)} Address
                ${address.isDefault ? '<span style="font-size: 0.8rem; color: var(--success-color);"> (Default)</span>' : ''}
            </h4>
            <p>${address.street}</p>
            <p>${address.city}, ${address.state} ${address.zip}</p>
            <p>${address.country}</p>
            <input type="radio" name="selectedAddress" value="${address.id}" ${address.isDefault ? 'checked' : ''} 
                   style="margin-top: 0.5rem; accent-color: var(--secondary-color);">
            <label>Use this address</label>
        `;

        addressList.appendChild(addressCard);

        // Make entire card clickable
        addressCard.addEventListener('click', () => {
            addressCard.querySelector('input[type="radio"]').checked = true;
        });
    });

    // Close modal
    document.getElementById('closeAddressModal').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.body.style.overflow = 'auto';
    });

    // Add new address
    document.getElementById('addNewAddressBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.body.style.overflow = 'auto';
        openProfileSidebar();
        document.querySelector('.profile-menu a[data-section="address"]').click();
        addNewAddress();
    });

    // Confirm checkout
    document.getElementById('confirmCheckoutBtn').addEventListener('click', () => {
        const selectedAddressId = document.querySelector('input[name="selectedAddress"]:checked')?.value;
        if (!selectedAddressId) {
            showCartNotification('Please select a delivery address', 'error');
            return;
        }

        const selectedAddress = userAddresses.find(addr => addr.id === selectedAddressId);
        document.body.removeChild(modal);
        document.body.style.overflow = 'auto';

        // Create order with address
        const newOrder = {
            id: 'ORD-' + Date.now().toString().slice(-6),
            date: new Date().toISOString().split('T')[0],
            items: [...cart],
            total: cart.reduce((total, item) => total + (item.price * item.quantity), 0),
            status: 'pending',
            userId: currentUser.id,
            shippingAddress: { ...selectedAddress }
        };

        initiatePayment(newOrder);
    });
}

function finalizeOrder(order) {
    orders.push(order);
    localStorage.setItem('fashionhubOrders', JSON.stringify(orders));
    cart = [];
    localStorage.setItem('fashionhubCart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();

    // Properly clean up the body styles
    document.body.classList.remove('cart-open', 'profile-open');
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    delete document.body.dataset.scrollY;

    // Close any open sidebars
    cartSidebar.classList.remove('open');
    profileSidebar.classList.remove('open');

    // Show success notification
    showPaymentSuccessNotification();

    // Update profile info if open
    if (profileSidebar.classList.contains('open')) {
        updateProfileInfo();
        renderOrderHistory();
        renderFullOrderHistory();
    }

    // Scroll to top smoothly
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Enhancements to wishlist and ratings
function toggleWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem('fashionhubWishlist')) || [];
    if (wishlist.includes(productId)) {
        wishlist = wishlist.filter(id => id !== productId);
        alert('Removed from wishlist');
    } else {
        wishlist.push(productId);
        alert('Added to wishlist');
    }
    localStorage.setItem('fashionhubWishlist', JSON.stringify(wishlist));
    renderWishlistIcons();
}

function renderWishlistIcons() {
    const wishlist = JSON.parse(localStorage.getItem('fashionhubWishlist')) || [];
    document.querySelectorAll('.wishlist-icon').forEach(icon => {
        const pid = icon.getAttribute('data-product-id');
        if (wishlist.includes(pid)) {
            icon.classList.add('active');
            icon.innerText = '❤️';
        } else {
            icon.classList.remove('active');
            icon.innerText = '🤍';
        }
    });
}

function renderProductRatings() {
    document.querySelectorAll('.rating-stars').forEach(stars => {
        const rating = parseFloat(stars.getAttribute('data-rating')) || 4.5;
        const fullStars = Math.floor(rating);
        let starHTML = '';
        for (let i = 0; i < 5; i++) {
            starHTML += i < fullStars ? '★' : '☆';
        }
        stars.innerHTML = starHTML;
    });
}

function setupDarkModeToggle() {
    const toggle = document.getElementById('darkModeToggle');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
}

function setupCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    let current = 0;
    setInterval(() => {
        slides[current].classList.remove('active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('active');
    }, 4000);
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const productCards = document.querySelectorAll('.product-card');
    searchInput?.addEventListener('input', () => {
        const term = searchInput.value.toLowerCase();
        productCards.forEach(card => {
            const text = card.innerText.toLowerCase();
            card.style.display = text.includes(term) ? '' : 'none';
        });
    });
}

function handleNewsletterSignup() {
    const emailInput = document.getElementById('newsletterEmail');
    const msgBox = document.getElementById('newsletterMsg');
    const email = emailInput.value.trim();
    if (!email || !email.includes('@')) {
        msgBox.innerText = 'Please enter a valid email address.';
        msgBox.style.color = 'red';
        return;
    }
    // Simulate server save (could be POST request in real scenario)
    let list = JSON.parse(localStorage.getItem('fashionhubNewsletter')) || [];
    if (!list.includes(email)) {
        list.push(email);
        localStorage.setItem('fashionhubNewsletter', JSON.stringify(list));
    }
    msgBox.innerText = 'Thanks for subscribing!';
    msgBox.style.color = 'green';
    emailInput.value = '';
}


   

    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleNewsletterSignup();
        });
    }


function setupCategoryFilters() {
    const filters = document.querySelectorAll('.category-filter');
    const cards = document.querySelectorAll('.product-card');

    filters.forEach(filter => {
        filter.addEventListener('change', () => {
            const selected = Array.from(filters).filter(f => f.checked).map(f => f.value);
            cards.forEach(card => {
                const cat = card.getAttribute('data-category');
                if (selected.length === 0 || selected.includes(cat)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}



const searchInput = document.getElementById('searchInput');
const searchSuggestions = document.getElementById('searchSuggestions');

// List of product names (you can expand this)
const productNames = [
    "Men's Casual Shirt",
    "Women's Summer Dress",
    "Men's Shoes",
    "Women's Dress",
    "Men's Jeans",
    "Women's Outfit",
    "Silk Scarf",
    "Running Shoes",
    "Leather Handbag",
    "Denim Jacket"
];

// Show suggestions on click
searchInput.addEventListener('focus', () => {
    showSuggestions('');
});

// Filter suggestions on typing
searchInput.addEventListener('input', (e) => {
    showSuggestions(e.target.value);
});

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-section')) {
        searchSuggestions.style.display = 'none';
    }
});

function showSuggestions(query) {
    const filtered = productNames.filter(name =>
        name.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered.length === 0) {
        searchSuggestions.style.display = 'none';
        return;
    }

    searchSuggestions.innerHTML = '';
    filtered.forEach(name => {
        const div = document.createElement('div');
        div.textContent = name;
        div.addEventListener('click', () => {
            searchInput.value = name;
            searchSuggestions.style.display = 'none';
            // Optional: trigger search or redirect to product page
        });
        searchSuggestions.appendChild(div);
    });

    searchSuggestions.style.display = 'block';

}

function showPaymentSuccessNotification() {
    const notification = document.createElement('div');
    notification.className = 'popup-message popup-success';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i> 
        Payment successful! Your order has been placed.
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}


// Add this to your product data (near the top of script.js)
const product = [
    "Men's Casual Shirt",
    "Women's Summer Dress",
    "Men's Shoes",
    "Women's Dress",
    "Men's Jeans",
    "Women's Outfit",
    "Silk Scarf",
    "Men's Formal Suit",
    "Women's Casual T-Shirt"
];

// Add this to your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    // ... existing code ...

    // Make search input clearable
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            searchSuggestions.style.display = 'none';

            // Show all products if they were filtered
            document.querySelectorAll('.product-card').forEach(card => {
                card.style.display = '';
            });
        }
    });
});

// Simple FAQ-based AI chatbot logic
const chatbotBtn = document.getElementById('toggleChatbot');
const chatbot = document.getElementById('chatbot');
const closeChatbot = document.getElementById('closeChatbot');
const chatbotInput = document.getElementById('chatbotInput');
const sendChatbotMessage = document.getElementById('sendChatbotMessage');
const chatbotMessages = document.getElementById('chatbotMessages');

chatbotBtn.addEventListener('click', () => {
    chatbot.style.display = 'flex';
});

closeChatbot.addEventListener('click', () => {
    chatbot.style.display = 'none';
});

sendChatbotMessage.addEventListener('click', handleChat);
chatbotInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleChat();
});

function handleChat() {
    const message = chatbotInput.value.trim();
    if (!message) return;

    appendMessage('You', message);
    chatbotInput.value = '';

    const response = getBotResponse(message.toLowerCase());
    setTimeout(() => appendMessage('Bot', response), 500);
}

function appendMessage(sender, text) {
    const msg = document.createElement('div');
    msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatbotMessages.appendChild(msg);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function getBotResponse(input) {
    if (input.includes('return')) return "You can return items within 7 days of delivery.";
    if (input.includes('order') || input.includes('status')) return "You can view your order status in the 'My Orders' section of your profile.";
    if (input.includes('shipping')) return "We offer free shipping on orders over ₹999!";
    if (input.includes('contact')) return "You can reach us at support@haridrafashionhub.com.";
    if (input.includes('cancel')) return "Orders can be cancelled from the 'My Orders' section before they are shipped.";
    return "I'm here to help! Try asking about returns, shipping, or how to track your order.";
}




// Add welcome message when chatbot opens
chatbotBtn.addEventListener('click', () => {
    chatbot.style.display = 'flex';
    // Only show welcome message if chat is empty
    if (chatbotMessages.children.length === 0) {
        appendMessage('Bot', getBotResponse('hello'));
    }
});

// Add these styles to your CSS (style.css)
/*
.chat-msg {
    margin-bottom: 15px;
    max-width: 80%;
}

.bot-msg {
    align-self: flex-start;
    background-color: #f0f0f0;
    border-radius: 15px 15px 15px 0;
    padding: 10px 15px;
}

.user-msg {
    align-self: flex-end;
    background-color: var(--secondary-color);
    color: white;
    border-radius: 15px 15px 0 15px;
    padding: 10px 15px;
}

.msg-sender {
    font-weight: bold;
    font-size: 0.8rem;
    margin-bottom: 5px;
}

.msg-text {
    line-height: 1.4;
}
*/


// Update the chatbot toggle event listener
chatbotBtn.addEventListener('click', () => {
    chatbot.style.display = 'flex';
    // Clear previous messages
    chatbotMessages.innerHTML = '';

    // Add welcome message
    appendMessage('Bot', "Hello! Welcome to Haridra Softtech FashionHub. How can I help you today? Here are some common questions:");

    // Add quick options
    const quickOptions = [
        'Order status and tracking',
        'Returns and exchanges',
        'Shipping information',
        'Payment options',
        'Size guides',
        'Current discounts and offers',
        'Product inquiries',
        'Contact information'
    ];

    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'quick-options';

    quickOptions.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'quick-option-btn';
        btn.textContent = option;
        btn.addEventListener('click', () => {
            // Remove all quick options
            document.querySelectorAll('.quick-option-btn').forEach(b => b.remove());
            // Handle the selected option
            handleQuickOption(option);
        });
        optionsContainer.appendChild(btn);
    });

    // Create a message container for the options
    const optionsMessage = document.createElement('div');
    optionsMessage.className = 'chat-msg bot-msg';
    optionsMessage.appendChild(optionsContainer);
    chatbotMessages.appendChild(optionsMessage);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
});

// Function to handle quick option selection
function handleQuickOption(option) {
    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'chat-msg bot-msg typing-indicator';
    typingIndicator.innerHTML = '<div class="msg-text">...</div>';
    chatbotMessages.appendChild(typingIndicator);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

    setTimeout(() => {
        // Remove typing indicator
        if (typingIndicator.parentNode) {
            typingIndicator.remove();
        }

        // Get response based on selected option
        let response = "";
        switch (option) {
            case 'Order status and tracking':
                response = "You can check your order status in the 'My Orders' section of your profile. Need help with a specific order? Please provide your order number.";
                break;
            case 'Returns and exchanges':
                response = "You can return or exchange items within 7 days of delivery. Items must be unused with original tags. Visit our Returns page for more details.";
                break;
            case 'Shipping information':
                response = "We offer: \n- Free shipping on orders over ₹999\n- Standard delivery: 3-5 business days\n- Express delivery: 1-2 business days (additional ₹150)";
                break;
            case 'Payment options':
                response = "We accept:\n💳 Credit/Debit Cards\n📱 UPI Payments\n💰 Net Banking\n💸 Cash on Delivery (COD)\nAll payments are secure with Razorpay.";
                break;
            case 'Size guides':
                response = "You can find size guides on each product page. If you need help choosing the right size, let me know which product you're interested in!";
                break;
            case 'Current discounts and offers':
                response = "Current offers:\n🎉 NEWUSER20 - 20% off first order\n🛍️ FASHION25 - 25% off orders over ₹2000\nCheck our homepage for seasonal offers!";
                break;
            case 'Product inquiries':
                response = "We have a wide range of fashion products. Could you be more specific? For example:\n- Men's shirts\n- Women's dresses\n- Accessories\n- Footwear";
                break;
            case 'Contact information':
                response = "You can reach our customer support:\n📧 Email: support@haridrasofttech.com\n📞 Phone: +91 9949585248\n🕒 Hours: 9AM-6PM, Mon-Sat";
                break;
            default:
                response = "I'm here to help! What else would you like to know?";
        }

        appendMessage('Bot', response);
    }, 1000);
}
// Enhanced Address Validation
function validateAddress(address) {
    const errors = {};

    // Required fields
    if (!address.street.trim()) errors.street = "Street address is required";
    if (!address.city.trim()) errors.city = "City is required";
    if (!address.state.trim()) errors.state = "State is required";
    if (!address.country.trim()) errors.country = "Country is required";

    // ZIP validation (6 digits for India)
    const zipPattern = /^\d{6}$/;
    if (!zipPattern.test(address.zip)) errors.zip = "Valid 6-digit ZIP code required";

    // Phone validation if present
    if (address.phone && !/^\d{10}$/.test(address.phone)) {
        errors.phone = "Valid 10-digit phone number required";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}



// Traffic Analytics
function trackPageView() {
    if (typeof gtag !== 'undefined') {
        gtag('config', 'G-XXXXXXX', {
            page_title: document.title,
            page_path: window.location.pathname,
            page_location: window.location.href
        });
    }

    // Simple local traffic tracking
    const traffic = JSON.parse(localStorage.getItem('siteTraffic')) || {
        totalVisits: 0,
        pages: {},
        lastVisit: null
    };

    traffic.totalVisits++;
    const page = window.location.pathname;
    traffic.pages[page] = (traffic.pages[page] || 0) + 1;
    traffic.lastVisit = new Date().toISOString();

    localStorage.setItem('siteTraffic', JSON.stringify(traffic));
}

// Call this on page load
document.addEventListener('DOMContentLoaded', trackPageView);
// Product Loading and Filtering
function loadProducts() {
    const products = JSON.parse(localStorage.getItem('fashionhubProducts')) || [];
    const container = document.getElementById('productsContainer');

    container.innerHTML = '';

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="product-content">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="price">₹${product.price.toLocaleString('en-IN')}</div>
                <div class="rating">Rating: ${product.rating} ★</div>
                <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
            </div>
        `;
        container.appendChild(card);
    });

    // Add event listeners to new add-to-cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function () {
            const productId = parseInt(this.getAttribute('data-id'));
            const product = products.find(p => p.id === productId);
            if (product) {
                addToCart(product, this);
            }
        });
    });
}

// Initialize products on page load
document.addEventListener('DOMContentLoaded', loadProducts);
// Product data for 30 products
const products = [
    {
        id: 1,
        name: "Men's Slim Fit Shirt",
        price: 1299,
        originalPrice: 1899,
        image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWVuJTIwc2hpcnR8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
        category: "men",
        rating: 4.5,
        ratingCount: 128
    },
    {
        id: 2,
        name: "Women's Floral Summer Dress",
        price: 1999,
        originalPrice: 2599,
        image: "https://images.unsplash.com/photo-1529903384028-929ae5dccdf1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d29tZW4lMjBkcmVzc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
        category: "women",
        rating: 4.7,
        ratingCount: 215
    },
    {
        id: 3,
        name: "Leather Crossbody Bag",
        price: 2499,
        image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmFnfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        category: "accessories",
        rating: 4.6,
        ratingCount: 178
    },
    {
        id: 4,
        name: "Men's Running Shoes",
        price: 2999,
        originalPrice: 3499,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2hvZXN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
        category: "footwear",
        rating: 4.4,
        ratingCount: 92
    },
    {
        id: 5,
        name: "Women's Denim Jacket",
        price: 2499,
        originalPrice: 2999,
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGVuaW0lMjBqYWNrZXR8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
        category: "women",
        rating: 4.8,
        ratingCount: 143
    },
    {
        id: 6,
        name: "Men's Casual T-Shirt Pack",
        price: 1499,
        originalPrice: 1999,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dHNoaXJ0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        category: "men",
        rating: 4.3,
        ratingCount: 87
    },
    {
        id: 7,
        name: "Designer Sunglasses",
        price: 1799,
        image: "https://images.unsplash.com/photo-1577803645773-f96470509666?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3VuZ2xhc3Nlc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
        category: "accessories",
        rating: 4.5,
        ratingCount: 64
    },
    {
        id: 8,
        name: "Women's High Heels",
        price: 2299,
        originalPrice: 2999,
        image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGVlbHN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
        category: "footwear",
        rating: 4.2,
        ratingCount: 56
    },
    {
        id: 9,
        name: "Men's Formal Suit",
        price: 5999,
        originalPrice: 7999,
        image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3VpdHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
        category: "men",
        rating: 4.9,
        ratingCount: 78
    },
    {
        id: 10,
        name: "Women's Silk Scarf",
        price: 899,
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2lsayUyMHNjYXJmfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        category: "accessories",
        rating: 4.7,
        ratingCount: 112
    },
    {
        id: 11,
        name: "Men's Casual Jeans",
        price: 1899,
        originalPrice: 2299,
        image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8amVhbnN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
        category: "men",
        rating: 4.6,
        ratingCount: 134
    },
    {
        id: 12,
        name: "Women's Leather Handbag",
        price: 3499,
        originalPrice: 3999,
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGFuZGJhZ3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
        category: "accessories",
        rating: 4.8,
        ratingCount: 189
    },
    {
        id: 13,
        name: "Unisex Sneakers",
        price: 2499,
        image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c25lYWtlcnN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
        category: "footwear",
        rating: 4.5,
        ratingCount: 201
    },
    {
        id: 14,
        name: "Men's Polo Shirt",
        price: 999,
        originalPrice: 1299,
        image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cG9sbyUyMHNoaXJ0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        category: "men",
        rating: 4.4,
        ratingCount: 98
    },
    {
        id: 15,
        name: "Women's Summer Top",
        price: 799,
        originalPrice: 999,
        image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dG9wfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        category: "women",
        rating: 4.6,
        ratingCount: 121
    },
    {
        id: 16,
        name: "Silver Necklace",
        price: 1499,
        image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bmVja2xhY2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
        category: "accessories",
        rating: 4.9,
        ratingCount: 76
    },
    {
        id: 17,
        name: "Men's Leather Belt",
        price: 899,
        originalPrice: 1199,
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmVsdHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
        category: "accessories",
        rating: 4.3,
        ratingCount: 67
    },
    {
        id: 18,
        name: "Women's Sandals",
        price: 1499,
        originalPrice: 1999,
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2FuZGFsc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
        category: "footwear",
        rating: 4.7,
        ratingCount: 89
    },
    {
        id: 19,
        name: "Men's Winter Jacket",
        price: 3999,
        originalPrice: 4999,
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8amFja2V0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        category: "men",
        rating: 4.8,
        ratingCount: 45
    },
    {
        id: 20,
        name: "Women's Handbag",
        price: 1999,
        originalPrice: 2499,
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGFuZGJhZ3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
        category: "accessories",
        rating: 4.5,
        ratingCount: 132
    },
    {
        id: 21,
        name: "Men's Sport Shoes",
        price: 2799,
        originalPrice: 3299,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3BvcnQlMjBzaG9lc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
        category: "footwear",
        rating: 4.6,
        ratingCount: 78
    },
    {
        id: 22,
        name: "Women's Blouse",
        price: 1299,
        originalPrice: 1599,
        image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmxvdXNlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        category: "women",
        rating: 4.4,
        ratingCount: 54
    },
    {
        id: 23,
        name: "Designer Watch",
        price: 4999,
        image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d2F0Y2h8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
        category: "accessories",
        rating: 4.9,
        ratingCount: 92
    },
    {
        id: 24,
        name: "Men's Chinos",
        price: 1699,
        originalPrice: 1999,
        image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpbm9zfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        category: "men",
        rating: 4.5,
        ratingCount: 67
    },
    {
        id: 25,
        name: "Women's Skirt",
        price: 1499,
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2tpcnR8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
        category: "women",
        rating: 4.7,
        ratingCount: 43
    },
    {
        id: 26,
        name: "Leather Wallet",
        price: 1299,
        originalPrice: 1599,
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d2FsbGV0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        category: "accessories",
        rating: 4.6,
        ratingCount: 89
    },
    {
        id: 27,
        name: "Men's Formal Shoes",
        price: 3499,
        originalPrice: 3999,
        image: "https://images.unsplash.com/photo-1560343090-f0409e92791a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zm9ybWFsJTIwc2hvZXN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
        category: "footwear",
        rating: 4.8,
        ratingCount: 56
    },
    {
        id: 28,
        name: "Women's Sweater",
        price: 1899,
        originalPrice: 2299,
        image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3dlYXRlcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
        category: "women",
        rating: 4.5,
        ratingCount: 76
    },
    {
        id: 29,
        name: "Men's Shorts",
        price: 1199,
        image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2hvcnRzfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        category: "men",
        rating: 4.3,
        ratingCount: 65
    },
    {
        id: 30,
        name: "Women's Boots",
        price: 2999,
        originalPrice: 3499,
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Ym9vdHN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
        category: "footwear",
        rating: 4.7,
        ratingCount: 48
    }
];

// Function to render products
function renderProducts() {
    const productsContainer = document.getElementById('productsContainer');
    productsContainer.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="discount-badge" style="${product.originalPrice ? '' : 'display: none'}">
                ${product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) + '% OFF' : ''}
            </div>
            <button class="wishlist-btn" data-id="${product.id}">
                <i class="far fa-heart"></i>
            </button>
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="quick-view">Quick View</div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">
                    <span class="current-price">₹${product.price.toLocaleString('en-IN')}</span>
                    ${product.originalPrice ? `<span class="original-price">₹${product.originalPrice.toLocaleString('en-IN')}</span>` : ''}
                </div>
                <div class="product-rating">
                    <div class="stars">
                        ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}
                    </div>
                    <span class="rating-count">(${product.ratingCount})</span>
                </div>
                <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
            </div>
        `;
        productsContainer.appendChild(productCard);
        // Add these CSS classes to your stylesheet:
        /*
        .add-to-cart-btn {
            background-color: #e74c3c;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.3s ease;
            margin-top: 10px;
            width: 100%;
        }
        
        .add-to-cart-btn:hover {
            background-color: #c0392b;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .add-to-cart-btn:active {
            transform: translateY(0);
        }
        
        .add-to-cart-btn i {
            font-size: 16px;
        }
        */
    });

    // Add event listeners to new add-to-cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function () {
            const productId = parseInt(this.getAttribute('data-id'));
            const product = products.find(p => p.id === productId);
            if (product) {
                addToCart(product, this);
            }
        });
    });

    // Add event listeners to wishlist buttons
    document.querySelectorAll('.wishlist-btn').forEach(button => {
        button.addEventListener('click', function () {
            const productId = parseInt(this.getAttribute('data-id'));
            toggleWishlist(productId);
        });
    });
}

// Function to toggle wishlist
function toggleWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem('fashionhubWishlist')) || [];
    const index = wishlist.indexOf(productId);

    const button = document.querySelector(`.wishlist-btn[data-id="${productId}"]`);

    if (index === -1) {
        // Add to wishlist
        wishlist.push(productId);
        button.innerHTML = '<i class="fas fa-heart" style="color: #e74c3c;"></i>';
        showCartNotification('Added to wishlist!', 'info');
    } else {
        // Remove from wishlist
        wishlist.splice(index, 1);
        button.innerHTML = '<i class="far fa-heart"></i>';
        showCartNotification('Removed from wishlist', 'info');
    }

    localStorage.setItem('fashionhubWishlist', JSON.stringify(wishlist));
}

// Function to initialize wishlist icons
function initWishlistIcons() {
    const wishlist = JSON.parse(localStorage.getItem('fashionhubWishlist')) || [];

    wishlist.forEach(productId => {
        const button = document.querySelector(`.wishlist-btn[data-id="${productId}"]`);
        if (button) {
            button.innerHTML = '<i class="fas fa-heart" style="color: #e74c3c;"></i>';
        }
    });
}

// Function to show newsletter popup
function showNewsletterPopup() {
    // Only show if not shown in this session
    if (!sessionStorage.getItem('newsletterShown')) {
        setTimeout(() => {
            document.getElementById('newsletterPopup').style.display = 'block';
            sessionStorage.setItem('newsletterShown', 'true');
        }, 10000);
    }
}

// Function to subscribe to newsletter
function subscribeNewsletter() {
    const email = document.getElementById('newsletterEmail').value;
    if (email && email.includes('@')) {
        let subscribers = JSON.parse(localStorage.getItem('newsletterSubscribers')) || [];
        if (!subscribers.includes(email)) {
            subscribers.push(email);
            localStorage.setItem('newsletterSubscribers', JSON.stringify(subscribers));
        }
        document.getElementById('newsletterPopup').style.display = 'none';
        showCartNotification('Thank you for subscribing!', 'success');
    } else {
        showCartNotification('Please enter a valid email', 'error');
    }
}

// Analytics functions
function trackPageView() {
    const traffic = JSON.parse(localStorage.getItem('siteTraffic')) || {
        totalVisits: 0,
        pages: {},
        lastVisit: null
    };

    traffic.totalVisits++;
    const page = window.location.pathname || 'index.html';
    traffic.pages[page] = (traffic.pages[page] || 0) + 1;
    traffic.lastVisit = new Date().toISOString();

    localStorage.setItem('siteTraffic', JSON.stringify(traffic));
    updateAnalyticsUI(traffic);
}

function updateAnalyticsUI(traffic) {
    document.getElementById('totalVisits').textContent = traffic.totalVisits.toLocaleString();
    document.getElementById('currentPageViews').textContent = (traffic.pages[window.location.pathname] || 0).toLocaleString();
    document.getElementById('lastVisit').textContent = traffic.lastVisit ? new Date(traffic.lastVisit).toLocaleString() : 'Never';

    renderAnalyticsChart(traffic);
}
// script.js
function updateAnalytics() {
    const analytics = JSON.parse(localStorage.getItem('fashionhubAnalytics')) || {
        totalVisits: 0,
        pageViews: {},
        lastVisit: null
    };

    // Update counts
    analytics.totalVisits++;
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    analytics.pageViews[currentPage] = (analytics.pageViews[currentPage] || 0) + 1;
    analytics.lastVisit = new Date().toISOString();

    // Save and update UI
    localStorage.setItem('fashionhubAnalytics', JSON.stringify(analytics));
    document.getElementById('totalVisits').textContent = analytics.totalVisits;
    document.getElementById('currentPageViews').textContent = analytics.pageViews[currentPage] || 0;
    document.getElementById('lastVisit').textContent =
        analytics.lastVisit ? new Date(analytics.lastVisit).toLocaleString() : 'Never';
}

// Call on page load
document.addEventListener('DOMContentLoaded', updateAnalytics);

function renderAnalyticsChart(traffic) {
    const ctx = document.getElementById('analyticsChart').getContext('2d');

    // Get top 5 pages
    const pages = Object.entries(traffic.pages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const labels = pages.map(([page]) => page.split('/').pop() || 'Home');
    const data = pages.map(([_, count]) => count);

    // Simple bar chart using canvas
    const maxValue = Math.max(...data);
    const barWidth = 50;
    const spacing = 30;
    const chartHeight = 180;
    const startX = 50;

    ctx.clearRect(0, 0, 400, 200);

    // Draw bars
    ctx.fillStyle = '#e74c3c';
    for (let i = 0; i < data.length; i++) {
        const barHeight = (data[i] / maxValue) * chartHeight;
        const x = startX + i * (barWidth + spacing);
        const y = 200 - barHeight;

        ctx.fillRect(x, y, barWidth, barHeight);

        // Draw label
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText(labels[i], x, 220);

        // Draw value
        ctx.fillText(data[i], x + barWidth / 2 - 10, y - 5);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    initWishlistIcons();
    showNewsletterPopup();
    trackPageView();

    // Add event listener for contact form
    document.getElementById('contactForm').addEventListener('submit', function (e) {
        e.preventDefault();
        showCartNotification('Message sent successfully!', 'success');
        this.reset();
    });
});

document.addEventListener("DOMContentLoaded", () => {

    attachAddressValidation();
    updateAuthUI();
    updateCartCount();
    setupDarkModeToggle();
    setupCarousel();
    setupSearch();
    renderWishlistIcons();
    renderProductRatings();

    document.querySelectorAll('.wishlist-icon').forEach(icon => {
        icon.addEventListener('click', () => {
            const pid = icon.getAttribute('data-product-id');
            toggleWishlist(pid);
        });
    });

    setupCategoryFilters();
});
