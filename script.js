
// Functions for login, registration, cart, etc.
function showDashboardSection() {
  document.querySelectorAll('.dashboard-content').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById('dashboardSection').classList.add('active');
  document.querySelectorAll('.profile-menu a').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector('.profile-menu a[data-section="dashboard"]').classList.add('active');
}

// ... Add all remaining JS here from the script tag ...



// User accounts storage (persists in localStorage)
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
    
    if (userAddresses.length === 0) {
        addressList.innerHTML = '<p>No addresses saved yet.</p>';
        return;
    }
    
    userAddresses.forEach(address => {
        const addressCard = document.createElement('div');
        addressCard.className = 'address-card';
        addressCard.style.border = '1px solid #eee';
        addressCard.style.borderRadius = '8px';
        addressCard.style.padding = '1rem';
        addressCard.style.marginBottom = '1rem';
        addressCard.style.position = 'relative';
        
        let addressHtml = `
            <h4 style="margin-top: 0; color: var(--primary-color);">${address.type.charAt(0).toUpperCase() + address.type.slice(1)} Address</h4>
            <p>${address.street}</p>
            <p>${address.city}, ${address.state} ${address.zip}</p>
            <p>${address.country}</p>
        `;
        
        if (address.isDefault) {
            addressHtml += '<span style="position: absolute; top: 1rem; right: 1rem; background-color: var(--success-color); color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem;">Default</span>';
        }
        
        addressHtml += `
            <div style="margin-top: 1rem;">
                <button class="btn" style="padding: 0.3rem 0.6rem; font-size: 0.9rem; margin-right: 0.5rem;" onclick="editAddress('${address.id}')">Edit</button>
                                        <button class="btn btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.9rem;" onclick="deleteAddress('${address.id}')">Delete</button>
            </div>
        `;
        
        addressCard.innerHTML = addressHtml;
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

// Close cart sidebar
function closeCartSidebar() {
    cartSidebar.classList.remove('open');
    document.body.classList.remove('cart-open');
    
    // Restore scroll position
    const scrollY = document.body.dataset.scrollY;
    if (scrollY) {
        window.scrollTo(0, scrollY);
        document.body.style.top = '';
        delete document.body.dataset.scrolly;
}
}

// Add to cart function
function addToCart(product) {
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
            
            // Save to localStorage
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('fashionhubUsers', JSON.stringify(users));
            
            // Update UI
            updateProfileInfo();
            
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
            
            addToCart(product);
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
            ondismiss: function() {
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
        alert('Your cart is empty!');
        return;
    }
    if (!currentUser) {
        alert('Please login to proceed to checkout');
        loginBtn.click();
        return;
    }
    const order = {
        id: 'ORD-' + Date.now().toString().slice(-6),
        date: new Date().toISOString().split('T')[0],
        items: [...cart],
        total: cart.reduce((total, item) => total + (item.price * item.quantity), 0),
        status: 'pending',
        userId: currentUser.id
    };
    initiatePayment(order);
}

function finalizeOrder(order) {
    orders.push(order);
    localStorage.setItem('fashionhubOrders', JSON.stringify(orders));
    cart = [];
    localStorage.setItem('fashionhubCart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
    closeCartSidebar();
    alert(`Order #${order.id} placed successfully! Total: ₹${order.total}`);
    if (profileSidebar.classList.contains('open')) {
        updateProfileInfo();
        renderOrderHistory();
        renderFullOrderHistory();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    attachAddressValidation();
    updateAuthUI();
    updateCartCount();
});

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

    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleNewsletterSignup();
        });
    }
});

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
  
  document.addEventListener("DOMContentLoaded", () => {
    setupCategoryFilters();
  });

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
        Payment successful! Redirecting to homepage...
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

