// إدارة مخازن البيانات الحقيقية محلياً وسحابياً عبر الذاكرة
let products = JSON.parse(localStorage.getItem('sys_products')) || [];
let sales = JSON.parse(localStorage.getItem('sys_sales')) || [];
let currentUser = JSON.parse(localStorage.getItem('sys_current_user')) || null;
let cart = [];

// الإقلاع الأولي للتطبيق وضبط الجلسات
window.onload = function() {
    checkUserSession();
    updateDashboardStats();
    populateDataLists();
};

// محرك التنبيهات المخصص والبديل كلياً عن الـ alert الافتراضي لإنهاء مشاكل الروابط
function showNotification(msg, type = "info") {
    const alertBox = document.getElementById('customAlert');
    const alertMsg = document.getElementById('alertMessage');
    const alertIcon = document.getElementById('alertIcon');
    
    alertMsg.innerText = msg;
    if(type === "success") {
        alertIcon.innerHTML = '<i class="fas fa-check-circle" style="color: #05c46b;"></i>';
    } else if(type === "error") {
        alertIcon.innerHTML = '<i class="fas fa-times-circle" style="color: #ff3f34;"></i>';
    } else {
        alertIcon.innerHTML = '<i class="fas fa-info-circle" style="color: #1e90ff;"></i>';
    }
    alertBox.classList.add('active');
}

function closeAlert() {
    document.getElementById('customAlert').classList.remove('active');
}

// نظام الدخول المباشر بدون تفعيل رموز خارجي
function handleFastLogin() {
    const username = document.getElementById('usernameInput').value.trim();
    const phone = document.getElementById('phoneInput').value.trim();

    if(!username || !phone) {
        showNotification("فضلاً، أكمل إدخال اسم المستخدم ورقم الهاتف!", "error");
        return;
    }

    currentUser = { username: username, phone: phone };
    localStorage.setItem('sys_current_user', JSON.stringify(currentUser));
    
    showNotification("تم التحقق والدخول بنجاح تام!", "success");
    checkUserSession();
}

function checkUserSession() {
    if(currentUser) {
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('appScreen').classList.add('active');
        document.getElementById('userInfo').innerHTML = `<i class="fas fa-user-shield"></i> ${currentUser.username}`;
        switchTab('dashboard');
    } else {
        document.getElementById('loginScreen').classList.add('active');
        document.getElementById('appScreen').classList.remove('active');
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('sys_current_user');
    checkUserSession();
}

// التبديل الداخلي النظيف للتبويبات لحماية التطبيق PWA من استدعاء شريط العنوان
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`content-${tabId}`).classList.add('active');
    document.getElementById(`tab-${tabId}`).classList.add('active');
    
    const titles = { 'dashboard': 'لوحة الإحصائيات', 'pos': 'شاشة المبيعات POS', 'products': 'إدارة المواد والرفوف', 'reports': 'سجل الفواتير والتقارير' };
    document.getElementById('appTitle').innerText = titles[tabId] || 'الرئيسية';

    if(tabId === 'products') renderProductsTable();
    if(tabId === 'pos') refreshPOS();
    if(tabId === 'reports') renderSalesTable();
    
    if(window.innerWidth < 768) {
        document.getElementById('sidebar').classList.remove('open');
    }
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// بناء وتحديث الاقتراحات الذكية مع الحفاظ على الكتابة الحرة كلياً
function populateDataLists() {
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    const aisles = [...new Set(products.map(p => p.aisle).filter(Boolean))];
    const shelves = [...new Set(products.map(p => p.shelf).filter(Boolean))];

    updateSingleDatalist('categoriesList', categories);
    updateSingleDatalist('aislesList', aisles);
    updateSingleDatalist('shelvesList', shelves);
}

function updateSingleDatalist(id, list) {
    const dl = document.getElementById(id);
    if(dl) {
        dl.innerHTML = list.map(item => `<option value="${item}">`).join('');
    }
}

// إدارة العمليات على المواد (إضافة، تعديل، حذف فعلي ومستمر)
function saveProduct() {
    const id = document.getElementById('editProductId').value;
    const barcode = document.getElementById('prodBarcode').value.trim();
    const name = document.getElementById('prodName').value.trim();
    const category = document.getElementById('prodCategory').value.trim();
    const aisle = document.getElementById('prodAisle').value.trim();
    const shelf = document.getElementById('prodShelf').value.trim();
    const cost = parseFloat(document.getElementById('prodCost').value) || 0;
    const price = parseFloat(document.getElementById('prodPrice').value) || 0;
    const qty = parseInt(document.getElementById('prodQty').value) || 0;

    if(!name) { showNotification("يرجى إدخال اسم المادة كحد أدنى!", "error"); return; }

    const productData = { id: id || Date.now().toString(), barcode, name, category, aisle, shelf, cost, price, qty };

    if(id) {
        const idx = products.findIndex(p => p.id === id);
        if(idx !== -1) products[idx] = productData;
    } else {
        products.push(productData);
    }

    localStorage.setItem('sys_products', JSON.stringify(products));
    showNotification("تمت عملية حفظ المادة في الذاكرة بنجاح!", "success");
    clearProductForm();
    renderProductsTable();
    populateDataLists();
    updateDashboardStats();
}

function deleteProduct(id) {
    products = products.filter(p => p.id !== id);
    localStorage.setItem('sys_products', JSON.stringify(products));
    showNotification("تم حذف المادة نهائياً من المخازن.", "success");
    renderProductsTable();
    updateDashboardStats();
    populateDataLists();
}

function editProduct(id) {
    const prod = products.find(p => p.id === id);
    if(!prod) return;

    document.getElementById('editProductId').value = prod.id;
    document.getElementById('prodBarcode').value = prod.barcode || '';
    document.getElementById('prodName').value = prod.name;
    document.getElementById('prodCategory').value = prod.category || '';
    document.getElementById('prodAisle').value = prod.aisle || '';
    document.getElementById('prodShelf').value = prod.shelf || '';
    document.getElementById('prodCost').value = prod.cost;
    document.getElementById('prodPrice').value = prod.price;
    document.getElementById('prodQty').value = prod.qty;

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function clearProductForm() {
    document.getElementById('editProductId').value = '';
    document.getElementById('prodBarcode').value = '';
    document.getElementById('prodName').value = '';
    document.getElementById('prodCategory').value = '';
    document.getElementById('prodAisle').value = '';
    document.getElementById('prodShelf').value = '';
    document.getElementById('prodCost').value = '';
    document.getElementById('prodPrice').value = '';
    document.getElementById('prodQty').value = '';
}

function renderProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    if(!tbody) return;
    
    if(products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#aaacb0; padding:20px;">المخازن فارغة تماماً. ابدأ بإدخال المواد.</td></tr>`;
        return;
    }

    tbody.innerHTML = products.map(p => `
        <tr>
            <td><strong>${p.name}</strong><br><small style="color:#666;"><i class="fas fa-barcode"></i> ${p.barcode || 'لا يوجد'}</small></td>
            <td><span class="badge-cat">${p.category || 'عام'}</span></td>
            <td>ممر: ${p.aisle || '-'} | رف: ${p.shelf || '-'}</td>
            <td><b style="color:${p.qty <= 3 ? '#ff3f34':'#05c46b'}">${p.qty} قطة</b></td>
            <td>${p.price.toLocaleString()} د.ع</td>
            <td>
                <button onclick="editProduct('${p.id}')" class="btn-table-edit"><i class="fas fa-pen"></i></button>
                <button onclick="deleteProduct('${p.id}')" class="btn-table-delete"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// محرك عمليات البيع المباشر (POS) والبحث الذكي بالباركود والاسم
function refreshPOS() {
    cart = [];
    renderCart();
    document.getElementById('posSearchInput').value = '';
    document.getElementById('posSearchResults').innerHTML = '';
}

function searchProductForPOS() {
    const query = document.getElementById('posSearchInput').value.toLowerCase().trim();
    const resultsDiv = document.getElementById('posSearchResults');
    
    if(!query) { resultsDiv.innerHTML = ''; return; }

    const matched = products.filter(p => p.name.toLowerCase().includes(query) || (p.barcode && p.barcode.includes(query)));
    
    if(matched.length === 0) {
        resultsDiv.innerHTML = `<div class="search-item-no">عذراً، لم نجد أي مادة مطابقة!</div>`;
        return;
    }

    resultsDiv.innerHTML = matched.map(p => `
        <div class="search-result-item" onclick="addItemToCart('${p.id}')">
            <span><b>${p.name}</b> (${p.price.toLocaleString()} د.ع)</span>
            <small>متوفر: ${p.qty} | موقع: ${p.aisle || '-'}/${p.shelf || '-'}</small>
        </div>
    `).join('');
}

function addItemToCart(id) {
    const prod = products.find(p => p.id === id);
    if(!prod) return;

    if(prod.qty <= 0) {
        showNotification("نفدت هذه المادة تماماً من المخزن الحالي!", "error");
        return;
    }

    const cartItem = cart.find(item => item.id === id);
    if(cartItem) {
        if(cartItem.itemQty >= prod.qty) {
            showNotification("عذراً، لقد تجاوزت كامل المخزون المتوفر لهذه المادة!", "error");
            return;
        }
        cartItem.itemQty++;
    } else {
        cart.push({ ...prod, itemQty: 1 });
    }

    document.getElementById('posSearchResults').innerHTML = '';
    document.getElementById('posSearchInput').value = '';
    renderCart();
}

function changeCartQty(id, change) {
    const item = cart.find(i => i.id === id);
    const prod = products.find(p => p.id === id);
    if(!item || !prod) return;

    item.itemQty += change;
    if(item.itemQty > prod.qty) {
        showNotification("الكمية المطلوبة غير متوفرة في المستودعات!", "error");
        item.itemQty = prod.qty;
    }
    if(item.itemQty <= 0) {
        cart = cart.filter(i => i.id !== id);
    }
    renderCart();
}

function renderCart() {
    const tbody = document.getElementById('cartTableBody');
    let total = 0;
    
    tbody.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.itemQty;
        total += itemTotal;
        return `
            <tr>
                <td><b>${item.name}</b></td>
                <td>${item.price.toLocaleString()}</td>
                <td>
                    <button class="btn-qty" onclick="changeCartQty('${item.id}', -1)">-</button>
                    <span class="qty-val">${item.itemQty}</span>
                    <button class="btn-qty" onclick="changeCartQty('${item.id}', 1)">+</button>
                </td>
                <td><b>${itemTotal.toLocaleString()} د.ع</b></td>
                <td><button onclick="changeCartQty('${item.id}', -${item.itemQty})" class="btn-cart-del"><i class="fas fa-trash-alt"></i></button></td>
            </tr>
        `;
    }).join('');
    
    document.getElementById('cartTotal').innerText = total.toLocaleString();
}

// إتمام حركة البيع وخصم كميات المواد من المستودع الفعلي وتوثيقها بالفاتورة
function checkoutCart() {
    if(cart.length === 0) { showNotification("سلة المبيعات فارغة، لا يمكن إصدار فاتورة!", "error"); return; }

    let total = 0;
    cart.forEach(item => {
        total += item.price * item.itemQty;
        const prod = products.find(p => p.id === item.id);
        if(prod) prod.qty -= item.itemQty; // الخصم الفعلي المباشر
    });

    const invoice = {
        invoiceId: 'INV-' + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleString('ar-EG'),
        total: total,
        items: cart
    };

    sales.unshift(invoice);
    localStorage.setItem('sys_products', JSON.stringify(products));
    localStorage.setItem('sys_sales', JSON.stringify(sales));

    showNotification(`تم إنهاء الفاتورة وحفظها بنجاح بقيمة ${total.toLocaleString()} د.ع`, "success");
    refreshPOS();
    updateDashboardStats();
}

// التقارير المباشرة
function renderSalesTable() {
    const tbody = document.getElementById('salesTableBody');
    if(!tbody) return;

    if(sales.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#aaa; padding:20px;">لم يتم تصدير فواتير مبيعات اليوم.</td></tr>`;
        return;
    }

    tbody.innerHTML = sales.map(s => `
        <tr>
            <td><strong>${s.invoiceId}</strong></td>
            <td><small>${s.date}</small></td>
            <td><b style="color:#05c46b;">${s.total.toLocaleString()} د.ع</b></td>
            <td><button class="btn-table-edit" onclick="showNotification('ميزة طباعة وتصدير الفاتورة PDF قيد المراجعة الفنية', 'info')"><i class="fas fa-print"></i></button></td>
        </tr>
    `).join('');
}

function updateDashboardStats() {
    if(document.getElementById('statTotalItems')) {
        document.getElementById('statTotalItems').innerText = products.length;
    }
    if(document.getElementById('statTotalSales')) {
        const todayTotal = sales.reduce((sum, s) => sum + s.total, 0);
        document.getElementById('statTotalSales').innerText = todayTotal.toLocaleString() + " د.ع";
    }
}

