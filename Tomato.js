// ============================================
// Tomato Food Delivery - Clean JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    if (window.__tomatoAppInitialized) {
        return;
    }
    window.__tomatoAppInitialized = true;

    const API_BASE = '/api';
    const storedCartId = localStorage.getItem('tomatoCartId');
    let authToken = localStorage.getItem('tomatoAuthToken') || '';

    // Initialize cart from localStorage or empty array
    let cart = JSON.parse(localStorage.getItem('tomatoCart')) || [];

    async function apiRequest(path, options = {}) {
        const headers = new Headers(options.headers || {});

        if (!headers.has('Content-Type') && options.body) {
            headers.set('Content-Type', 'application/json');
        }

        const response = await fetch(`${API_BASE}${path}`, {
            ...options,
            headers
        });

        const contentType = response.headers.get('content-type') || '';
        const payload = contentType.includes('application/json')
            ? await response.json()
            : await response.text();

        if (!response.ok) {
            const message = typeof payload === 'object' && payload && payload.error
                ? payload.error
                : 'Request failed';
            throw new Error(message);
        }

        return payload;
    }

    // Search panel toggle
    const searchToggle = document.getElementById('search-toggle');
    const searchContainer = document.getElementById('search-container');

    if (searchToggle && searchContainer) {
        searchToggle.addEventListener('click', function(event) {
            event.preventDefault();
            searchContainer.classList.toggle('hidden');
        });
    }

    // Cart modal functionality
    const cartIcon = document.getElementById('cart-icon');
    const cartModal = document.getElementById('cart-modal');
    const closeCart = document.getElementById('close-cart');
    const cartItemsList = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartTableBody = document.getElementById('cart-table-body');
    const emptyCartRow = document.getElementById('empty-cart-row');
    const subtotalAmount = document.getElementById('subtotal-amount');
    const totalAmount = document.getElementById('total-amount');
    const checkoutTotal = document.getElementById('checkout-total');
    const checkoutItems = document.getElementById('checkout-items');
    const deliveryFee = 5;

    function getStoredCartId() {
        return localStorage.getItem('tomatoCartId') || storedCartId || '';
    }

    async function syncCartToBackend() {
        try {
            const result = await apiRequest('/cart/sync', {
                method: 'POST',
                body: JSON.stringify({
                    cartId: getStoredCartId(),
                    items: cart
                })
            });

            if (result && result.cartId) {
                localStorage.setItem('tomatoCartId', result.cartId);
            }
        } catch (error) {
            console.error('Cart sync failed:', error.message);
        }
    }

    async function restoreCartFromBackend() {
        const cartId = getStoredCartId();
        if (!cartId) {
            return;
        }

        try {
            const data = await apiRequest(`/cart/${encodeURIComponent(cartId)}`);
            if (data && Array.isArray(data.items) && data.items.length > 0) {
                cart = data.items;
                localStorage.setItem('tomatoCart', JSON.stringify(cart));
            }
        } catch (error) {
            console.error('Cart restore failed:', error.message);
        }
    }

    function setAuthToken(token) {
        authToken = token || '';
        if (authToken) {
            localStorage.setItem('tomatoAuthToken', authToken);
        } else {
            localStorage.removeItem('tomatoAuthToken');
        }
    }

    function getCartSubtotal() {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    function removeCartItem(index) {
        cart.splice(index, 1);
        saveCart();
        renderCartUI();
    }

    function updateCartDisplay() {
        if (!cartItemsList || !emptyCartMessage) return;

        cartItemsList.innerHTML = '';

        if (cart.length === 0) {
            emptyCartMessage.classList.remove('hidden');
            cartItemsList.classList.add('hidden');
        } else {
            emptyCartMessage.classList.add('hidden');
            cartItemsList.classList.remove('hidden');

            cart.forEach((item, index) => {
                const li = document.createElement('li');

                const img = document.createElement('img');
                img.src = item.image || 'images/default-food.jpg';
                img.alt = item.name;
                img.style.width = '50px';
                img.style.height = '50px';
                img.style.borderRadius = '8px';
                img.style.marginRight = '10px';
                img.style.objectFit = 'cover';

                const itemInfo = document.createElement('div');
                itemInfo.className = 'item-info';
                itemInfo.innerHTML = `
                    <div><strong>${item.name}</strong></div>
                    <div>Qty: ${item.quantity} × $${item.price}</div>
                    <div>Total: $${(item.quantity * item.price).toFixed(2)}</div>
                `;

                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-btn';
                removeBtn.innerHTML = '×';
                removeBtn.title = 'Remove item';
                removeBtn.addEventListener('click', () => {
                    removeCartItem(index);
                });

                li.appendChild(img);
                li.appendChild(itemInfo);
                li.appendChild(removeBtn);
                cartItemsList.appendChild(li);
            });
        }
    }

    function updateCartTable() {
        if (!cartTableBody) return;

        cartTableBody.innerHTML = '';

        if (cart.length === 0) {
            if (emptyCartRow) {
                cartTableBody.appendChild(emptyCartRow);
            } else {
                const row = document.createElement('tr');
                row.innerHTML = '<td colspan="6" style="text-align: center; padding: 2rem;">Your cart is empty</td>';
                cartTableBody.appendChild(row);
            }
            return;
        }

        cart.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${item.image || 'images/default-food.jpg'}" alt="${item.name}"></td>
                <td>${item.name}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td>$${(item.price * item.quantity).toFixed(2)}</td>
                <td><button type="button" class="remove-btn" aria-label="Remove ${item.name}">×</button></td>
            `;

            const removeButton = row.querySelector('.remove-btn');
            if (removeButton) {
                removeButton.addEventListener('click', () => removeCartItem(index));
            }

            cartTableBody.appendChild(row);
        });
    }

    function updateCartTotals() {
        const subtotal = getCartSubtotal();
        const orderTotal = cart.length > 0 ? subtotal + deliveryFee : deliveryFee;

        if (subtotalAmount) {
            subtotalAmount.textContent = `$${subtotal.toFixed(2)}`;
        }

        if (totalAmount) {
            totalAmount.textContent = `$${orderTotal.toFixed(2)}`;
        }

        if (checkoutTotal) {
            checkoutTotal.textContent = `$${orderTotal.toFixed(2)}`;
        }

        if (checkoutItems) {
            checkoutItems.innerHTML = '';
            if (cart.length === 0) {
                const item = document.createElement('li');
                item.textContent = 'No items yet';
                checkoutItems.appendChild(item);
            } else {
                cart.forEach(item => {
                    const line = document.createElement('li');
                    line.textContent = `${item.quantity} x ${item.name} - $${(item.price * item.quantity).toFixed(2)}`;
                    checkoutItems.appendChild(line);
                });
            }
        }
    }

    function renderCartUI() {
        updateCartDisplay();
        updateCartCount();
        updateCartTable();
        updateCartTotals();
    }

    function updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'inline' : 'none';
        }
    }

    function saveCart() {
        localStorage.setItem('tomatoCart', JSON.stringify(cart));
        syncCartToBackend();
    }

    if (cartIcon && cartModal) {
        cartIcon.addEventListener('click', function(event) {
            event.preventDefault();
            cartModal.classList.toggle('hidden');
            updateCartDisplay();
        });
    }

    if (closeCart) {
        closeCart.addEventListener('click', () => {
            cartModal.classList.add('hidden');
        });
    }

    // Close cart modal when clicking outside
    document.addEventListener('click', function(event) {
        if (cartModal && cartIcon && !cartModal.contains(event.target) && !cartIcon.contains(event.target)) {
            cartModal.classList.add('hidden');
        }
    });

    // Menu items - Add to cart functionality
    document.querySelectorAll('.dish-item').forEach(dishItem => {
        const minusBtn = dishItem.querySelector('.quantity-controls button:first-child');
        const plusBtn = dishItem.querySelector('.quantity-controls button:last-child');
        const quantityInput = dishItem.querySelector('.quantity');
        const addToCartBtn = dishItem.querySelector('.add-to-cart');

        if (minusBtn && plusBtn && quantityInput) {
            minusBtn.addEventListener('click', () => {
                const currentValue = parseInt(quantityInput.value) || 1;
                if (currentValue > 1) {
                    quantityInput.value = currentValue - 1;
                }
            });

            plusBtn.addEventListener('click', () => {
                const currentValue = parseInt(quantityInput.value) || 1;
                quantityInput.value = currentValue + 1;
            });
        }

        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                const dishName = dishItem.querySelector('h3').textContent;
                const priceText = dishItem.querySelector('.price').textContent;
                const price = parseFloat(priceText.replace('$', ''));
                const quantity = parseInt(quantityInput.value) || 1;
                const image = dishItem.querySelector('img').src;

                const existingItem = cart.find(item => item.name === dishName);
                if (existingItem) {
                    existingItem.quantity += quantity;
                } else {
                    cart.push({
                        name: dishName,
                        price: price,
                        quantity: quantity,
                        image: image
                    });
                }

                saveCart();
                renderCartUI();

                // Reset quantity to 1
                if (quantityInput) quantityInput.value = 1;

                // Show success message
                showNotification(`${quantity} × ${dishName} added to cart!`, 'success');
            });
        }
    });

    // Modal functionality
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');

    function openModal(modal) {
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal(modal) {
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }

    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(loginModal);
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(registerModal);
        });
    }

    const showRegisterLink = document.getElementById('show-register');
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(loginModal);
            openModal(registerModal);
        });
    }

    const showLoginLink = document.getElementById('show-login');
    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(registerModal);
            openModal(loginModal);
        });
    }

    // Close modal buttons
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            closeModal(modal);
        });
    });

    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    // Login form
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = this.querySelector('input[type="email"]').value;
            const password = this.querySelector('input[type="password"]').value;
            const terms = this.querySelector('input[type="checkbox"]').checked;

            if (!email || !password) {
                showNotification('Please fill in all fields', 'error');
                return;
            }

            if (!terms) {
                showNotification('Please agree to terms and conditions', 'error');
                return;
            }

            try {
                const data = await apiRequest('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password })
                });

                setAuthToken(data.token || '');
                showNotification('Login successful!', 'success');
                closeModal(loginModal);
                this.reset();
            } catch (error) {
                showNotification(error.message, 'error');
            }
        });
    }

    // Register form
    const registerForm = document.querySelector('.register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const firstName = document.getElementById('reg-first-name').value.trim();
            const lastName = document.getElementById('reg-last-name').value.trim();
            const name = `${firstName} ${lastName}`.trim();
            const email = this.querySelector('input[type="email"]').value;
            const password = this.querySelector('input[type="password"]').value;
            const terms = this.querySelector('input[type="checkbox"]').checked;

            if (!name || !email || !password) {
                showNotification('Please fill in all fields', 'error');
                return;
            }

            if (!terms) {
                showNotification('Please agree to terms and conditions', 'error');
                return;
            }

            try {
                const data = await apiRequest('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({ name, email, password })
                });

                setAuthToken(data.token || '');
                showNotification('Registration successful!', 'success');
                closeModal(registerModal);
                this.reset();
            } catch (error) {
                showNotification(error.message, 'error');
            }
        });
    }

    // Contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const name = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const message = this.querySelector('textarea').value;

            if (!name || !email || !message) {
                showNotification('Please fill in all fields', 'error');
                return;
            }

            try {
                await apiRequest('/contact', {
                    method: 'POST',
                    body: JSON.stringify({ name, email, message })
                });

                showNotification('Message sent successfully!', 'success');
                this.reset();
            } catch (error) {
                showNotification(error.message, 'error');
            }
        });
    }

    // Checkout functionality
    const proceedCheckoutBtn = document.getElementById('proceed-checkout');
    if (proceedCheckoutBtn) {
        proceedCheckoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showNotification('Your cart is empty', 'error');
                return;
            }
            window.location.href = '#checkout';
        });
    }

    // Payment form
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const requiredFields = this.querySelectorAll('input[required], select[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = 'red';
                } else {
                    field.style.borderColor = '';
                }
            });

            if (!isValid) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }

            const orderPayload = {
                customer: {
                    firstName: document.getElementById('first-name').value.trim(),
                    lastName: document.getElementById('last-name').value.trim(),
                    email: document.getElementById('delivery-email').value.trim(),
                    street: document.getElementById('street').value.trim(),
                    city: document.getElementById('city').value.trim(),
                    state: document.getElementById('state').value.trim(),
                    zipCode: document.getElementById('zip-code').value.trim(),
                    country: document.getElementById('delivery-country').value.trim(),
                    phone: document.getElementById('phone').value.trim()
                },
                items: cart,
                subtotal: getCartSubtotal(),
                total: cart.length > 0 ? getCartSubtotal() + deliveryFee : deliveryFee,
                payment: {
                    email: document.getElementById('payment-email').value.trim(),
                    cardNumber: document.getElementById('card-number').value.trim()
                }
            };

            try {
                const result = await apiRequest('/orders', {
                    method: 'POST',
                    body: JSON.stringify(orderPayload)
                });

                showNotification('Payment successful! Thank you for your order.', 'success');
                cart = [];
                saveCart();
                renderCartUI();
                localStorage.removeItem('tomatoCartId');
                this.reset();
                const deliveryForm = document.getElementById('delivery-form');
                if (deliveryForm) {
                    deliveryForm.reset();
                }
                if (typeof result.orderId !== 'undefined') {
                    console.log('Created order', result.orderId);
                }
                window.location.href = '#home';
            } catch (error) {
                showNotification(error.message, 'error');
            }
        });
    }

    // Promo code functionality
    const promoSubmit = document.getElementById('promo-submit');
    if (promoSubmit) {
        promoSubmit.addEventListener('click', function(e) {
            e.preventDefault();
            const promoCode = document.getElementById('promo-code-input').value.trim().toLowerCase();

            if (promoCode === 'discount10') {
                showNotification('Promo code applied! 10% discount added.', 'success');
                // TODO: Implement discount calculation
            } else {
                showNotification('Invalid promo code', 'error');
            }
        });
    }

    // Notification system
    function showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            animation: 'slideIn 0.3s ease-out'
        });

        // Set background color based on type
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            info: '#2196F3',
            warning: '#FF9800'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Add notification animations to CSS if not present
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') {
                return;
            }

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Search menu by scrolling to the first matched dish without hiding the full menu.
    function clearSearchHighlights() {
        document.querySelectorAll('.dish-item.search-highlight').forEach(item => {
            item.classList.remove('search-highlight');
        });
    }

    function searchAndScrollToDish() {
        const searchInput = document.getElementById('search-input');
        if (!searchInput) return;

        const query = searchInput.value.trim().toLowerCase();
        const dishItems = document.querySelectorAll('.dish-item');
        clearSearchHighlights();

        if (!query) {
            const menuSection = document.getElementById('menu');
            if (menuSection) {
                menuSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            return;
        }

        let firstMatch = null;
        dishItems.forEach(item => {
            const titleText = (item.querySelector('h3')?.textContent || '').toLowerCase();
            const descText = (item.querySelector('p')?.textContent || '').toLowerCase();

            if (!firstMatch && (titleText.includes(query) || descText.includes(query))) {
                firstMatch = item;
            }
        });

        if (firstMatch) {
            firstMatch.classList.add('search-highlight');
            firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            showNotification('No menu item found for your search', 'warning');
        }
    }

    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', searchAndScrollToDish);
        searchInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                searchAndScrollToDish();
            }
        });
        searchInput.addEventListener('input', function() {
            if (!searchInput.value.trim()) {
                clearSearchHighlights();
            }
        });
    }

    restoreCartFromBackend().finally(() => {
        renderCartUI();
    });

    // Form validation helpers
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePhone(phone) {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    // Add loading states to buttons
    document.querySelectorAll('button[type="submit"], .add-to-cart, .login-btn, .register-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.form && this.form.checkValidity()) {
                this.textContent = 'Processing...';
                this.disabled = true;

                // Re-enable after 3 seconds (in case of error)
                setTimeout(() => {
                    this.textContent = this.dataset.originalText || 'Submit';
                    this.disabled = false;
                }, 3000);
            }
        });
    });

    // Store original button text
    document.querySelectorAll('button[type="submit"], .add-to-cart, .login-btn, .register-btn').forEach(btn => {
        btn.dataset.originalText = btn.textContent;
    });

    console.log('Tomato Food Delivery JavaScript loaded successfully');
});