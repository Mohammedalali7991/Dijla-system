// التهيئة البرمجية والربط الصارم بالـ LocalStorage لمنع تصفير أو نسيان أي حركة بيانات
let products = JSON.parse(localStorage.getItem('sys_products')) || [];
let sales = JSON.parse(localStorage.getItem('sys_sales')) || [];
let suppliers = JSON.parse(localStorage.getItem('sys_suppliers')) || [];
let currentUser = JSON.parse(localStorage.getItem('sys_current_user')) || null;
let cart = [];

window.onload = function() {
    checkUserSession();
    updateDashboardStats();
    populateDataLists();
    checkStockAlerts();
};

// نظام المودال والتنبيه المخصص فائق الجودة والسرعة
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

function showDetailsModal(title, htmlContent) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalContent').innerHTML = htmlContent;
    document.getElementById('detailsModal').classList.add('active');
}

function closeDetailsModal() {
    document.getElementById('detailsModal').classList.remove('active');
}

// نظام التحقق الفوري والدخول المباشر
function handleFastLogin() {
    const username = document.getElementById('usernameInput').value.trim();
    const phone = document.getElementById('phoneInput').value.trim();

    if(!username || !phone) {
        showNotification("الرجاء ملء حقول الدخول لفتح المنظومة بنجاح!", "error");
        return;
    }

    currentUser = { username, phone };
    localStorage.setItem('sys_current_user', JSON.stringify(currentUser));
    showNotification("تم تفعيل صلاحيات الدخول للمهندس المبرمج بنجاح!", "success");
    checkUserSession();
}

function checkUserSession() {
    if(currentUser) {
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('appScreen').classList.add('active');
        document.getElementById('userInfo').innerHTML = `<i class="fas fa-user-astronaut"></i> ${currentUser.username}`;
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

// محرك تبويب الشاشات المتكامل للحاسوب والموبايل
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`content-${tabId}`).classList.add('active');
    document.getElementById(`tab-${tabId}`).classList.add('active');
    
    const titles = {
        'dashboard': 'لوحة الإحصائيات وصافي الأرباح المتوقعة',
        'pos': 'نقطة البيع الفورية POS',
        'products': 'دليل إدارة المواد وموقع الرفوف بالكامل',
        'suppliers': 'حسابات وتوريد ديون المكاتب والمعامل',
        'debts': 'سجل الأقساط الشهرية وديون العملاء',
        'reports': 'الأرشيف العام وتقارير الجرد المالي'
    };
    document.getElementById('appTitle').innerText = titles[tabId] || 'الرئيسية';

    if(tabId === 'dashboard') { updateDashboardStats(); checkStockAlerts(); }
    if(tabId === 'products') renderProductsTable();
    if(tabId === 'pos') refreshPOS();
    if(tabId === 'suppliers') renderSuppliersTable();
    if(tabId === 'debts') renderDebtsTable();
    if(tabId === 'reports') renderSalesTable();
    
    if(window.innerWidth < 768) {
        document.getElementById('sidebar').classList.remove('open');
    }
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

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
    if(dl) dl.innerHTML = list.map(item => `<option value="${item}">`).join('');
}

// ======================== إدارة المواد والمخزون عالي الدقة ========================
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
    const minQty = parseInt(document.getElementById('prodMinQty').value) || 5;

    if(!name) { showNotification("يرجى إدخال اسم المادة لتوثيقها هندسياً بالمخزن!", "error"); return; }

    const productData = { id: id || Date.now().toString(), barcode, name, category, aisle, shelf, cost, price, qty, minQty };

    if(id) {
        const idx = products.findIndex(p => p.id === id);
        if(idx !== -1) products[idx] = productData;
    } else {
        products.push(productData);
    }

    localStorage.setItem('sys_products', JSON.stringify(products));
    showNotification("تم إدراج المادة وتحديث الـ LocalStorage بنجاح فائق.", "success");
    clearProductForm();
    renderProductsTable();
    populateDataLists();
    updateDashboardStats();
}

function deleteProduct(id) {
    products = products.filter(p => p.id !== id);
    localStorage.setItem('sys_products', JSON.stringify(products));
    showNotification("تم مسح قيد المادة بالكامل من جرد المستودعات.", "success");
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
    document.getElementById('prodMinQty').value = prod.minQty || 5;

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
    document.getElementById('prodMinQty').value = '5';
}

function renderProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    if(!tbody) return;

    const filterQuery = document.getElementById('inventorySearch')?.value.toLowerCase().trim() || "";
    const filtered = products.filter(p => p.name.toLowerCase().includes(filterQuery) || (p.shelf && p.shelf.toLowerCase().includes(filterQuery)) || (p.barcode && p.barcode.includes(filterQuery)));

    if(filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#888; padding:20px;">لا توجد قيود مطابقة لبحث الجرد الحالي.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(p => `
        <tr>
            <td><strong>${p.name}</strong><br><small style="color:#666;"><i class="fas fa-barcode"></i> ${p.barcode || 'بدون رمز كود'}</small></td>
            <td><span class="badge-cat" style="background:#dfe4ea; color:#2f3542;">${p.category || 'غير مصنف'}</span></td>
            <td>ممر: ${p.aisle || '-'} | رف: ${p.shelf || '-'}</td>
            <td><b style="color:${p.qty <= (p.minQty || 5) ? '#ff3f34':'#05c46b'}">${p.qty} قطة</b></td>
            <td>${p.price.toLocaleString()} د.ع</td>
            <td>
                <button onclick="editProduct('${p.id}')" class="btn-table-edit"><i class="fas fa-pen"></i></button>
                <button onclick="deleteProduct('${p.id}')" class="btn-table-delete"><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>
    `).join('');
}

// ======================== محرك شاشة المبيعات المعقدة ونقطة البيع ========================
function refreshPOS() {
    cart = [];
    renderCart();
    document.getElementById('posSearchInput').value = '';
    document.getElementById('posSearchResults').innerHTML = '';
    document.getElementById('posSaleType').value = 'cash';
    document.getElementById('posCustomerName').value = '';
    document.getElementById('posAmountPaid').value = '0';
    document.getElementById('posAmountRemaining').value = '0';
    togglePosDebtFields();
}

function togglePosDebtFields() {
    const type = document.getElementById('posSaleType').value;
    document.querySelectorAll('.pos-debt-field').forEach(f => f.style.display = type === 'debt' ? 'block' : 'none');
    calculatePosRemaining();
}

function calculatePosRemaining() {
    const total = cart.reduce((sum, i) => sum + (i.price * i.itemQty), 0);
    const paid = parseFloat(document.getElementById('posAmountPaid').value) || 0;
    const rem = total - paid;
    document.getElementById('posAmountRemaining').value = rem > 0 ? rem : 0;
}

function searchProductForPOS() {
    const query = document.getElementById('posSearchInput').value.toLowerCase().trim();
    const resultsDiv = document.getElementById('posSearchResults');
    if(!query) { resultsDiv.innerHTML = ''; return; }

    const matched = products.filter(p => p.name.toLowerCase().includes(query) || (p.barcode && p.barcode.includes(query)));
    if(matched.length === 0) {
        resultsDiv.innerHTML = `<div class="search-item-no">لا يوجد سجل يطابق البحث الفوري!</div>`;
        return;
    }

    resultsDiv.innerHTML = matched.map(p => `
        <div class="search-result-item" onclick="addItemToCart('${p.id}')">
            <span><b>${p.name}</b> (${p.price.toLocaleString()} د.ع)</span>
            <small>المتاح: ${p.qty} قطة | الرف: ${p.shelf || '-'}</small>
        </div>
    `).join('');
}

function addItemToCart(id) {
    const prod = products.find(p => p.id === id);
    if(!prod) return;

    if(prod.qty <= 0) {
        showNotification("المادة نفدت كلياً من الجرد الفعلي للمخزن!", "error");
        return;
    }

    const cartItem = cart.find(i => i.id === id);
    if(cartItem) {
        if(cartItem.itemQty >= prod.qty) {
            showNotification("تم استهلاك أقصى كمية جرد متاحة لهذه المادة بالمخزن السحابي!", "error");
            return;
        }
        cartItem.itemQty++;
    } else {
        cart.push({ ...prod, itemQty: 1 });
    }

    document.getElementById('posSearchResults').innerHTML = '';
    document.getElementById('posSearchInput').value = '';
    renderCart();
    calculatePosRemaining();
}

function changeCartQty(id, change) {
    const item = cart.find(i => i.id === id);
    const prod = products.find(p => p.id === id);
    if(!item || !prod) return;

    item.itemQty += change;
    if(item.itemQty > prod.qty) {
        showNotification("الكميات المطلوبة غير متوفرة في المستودع حالياً!", "error");
        item.itemQty = prod.qty;
    }
    if(item.itemQty <= 0) cart = cart.filter(i => i.id !== id);
    renderCart();
    calculatePosRemaining();
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

function checkoutCart() {
    if(cart.length === 0) { showNotification("سلة الشراء فارغة من أي مواد!", "error"); return; }

    const type = document.getElementById('posSaleType').value;
    const customerName = document.getElementById('posCustomerName').value.trim();
    const total = cart.reduce((sum, i) => sum + (i.price * i.itemQty), 0);
    const paid = parseFloat(document.getElementById('posAmountPaid').value) || 0;
    const remaining = total - paid;

    if(type === 'debt' && !customerName) {
        showNotification("يرجى كتابة اسم الزبون لتسجيل قيد الفاتورة كأقساط / آجل!", "error");
        return;
    }

    // الخصم الحقيقي المباشر والنهائي من مصفوفة الجرد
    cart.forEach(item => {
        const prod = products.find(p => p.id === item.id);
        if(prod) prod.qty -= item.itemQty;
    });

    const invoice = {
        invoiceId: 'INV-' + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleString('ar-EG'),
        type: type === 'debt' ? 'آجل / أقساط' : 'نقدي',
        customerName: customerName || 'زبون نقدي مباشر',
        total: total,
        paid: type === 'debt' ? paid : total,
        remaining: type === 'debt' ? remaining : 0,
        items: cart
    };

    sales.unshift(invoice);
    localStorage.setItem('sys_products', JSON.stringify(products));
    localStorage.setItem('sys_sales', JSON.stringify(sales));

    showNotification("تم إنهاء واعتماد الفاتورة بنجاح في النظام المالي وجاري التحديث.", "success");
    printSingleInvoice(invoice.invoiceId); // طباعة فورية للمهندس
    refreshPOS();
    updateDashboardStats();
}

// ======================== حسابات الموردين والدفع الجزئي الذكي ========================
function saveSupplier() {
    const id = document.getElementById('editSupplierId').value;
    const name = document.getElementById('supName').value.trim();
    const company = document.getElementById('supCompany').value.trim();
    const phone = document.getElementById('supPhone').value.trim();
    const debt = parseFloat(document.getElementById('supDebt').value) || 0;

    if(!name) { showNotification("اسم المورد حقل جوهري لا يمكن حذفه!", "error"); return; }

    const data = { id: id || Date.now().toString(), name, company, phone, debt };

    if(id) {
        const idx = suppliers.findIndex(s => s.id === id);
        if(idx !== -1) suppliers[idx] = data;
    } else {
        suppliers.push(data);
    }

    localStorage.setItem('sys_suppliers', JSON.stringify(suppliers));
    showNotification("تم توثيق بيانات المورد الحسابية بنجاح.", "success");
    clearSupplierForm();
    renderSuppliersTable();
}

function payPartialSupplierDebt(id) {
    const sup = suppliers.find(s => s.id === id);
    if(!sup || sup.debt <= 0) { showNotification("الحساب مسدد بالكامل سابقاً!", "info"); return; }

    const amount = prompt(`أدخل المبلغ المراد تسديده للمورد: ${sup.name} (الدين الكلي الحالي: ${sup.debt} د.ع)`);
    const val = parseFloat(amount);
    
    if(isNaN(val) || val <= 0) { showNotification("القيمة المدخلة غير صالحة للعمليات المالية!", "error"); return; }
    if(val > sup.debt) { showNotification("المبلغ المدخل أكبر من قيمة الدين الفعلي المستحق للمورد!", "error"); return; }

    sup.debt -= val;
    localStorage.setItem('sys_suppliers', JSON.stringify(suppliers));
    showNotification(`تم تسجيل دفع جزء مالي بقيمة ${val.toLocaleString()} د.ع بنجاح فائق!`, "success");
    renderSuppliersTable();
}

function deleteSupplier(id) {
    suppliers = suppliers.filter(s => s.id !== id);
    localStorage.setItem('sys_suppliers', JSON.stringify(suppliers));
    showNotification("تم إقصاء المورد من الدفاتر الحالية.", "success");
    renderSuppliersTable();
}

function clearSupplierForm() {
    document.getElementById('editSupplierId').value = '';
    document.getElementById('supName').value = '';
    document.getElementById('supCompany').value = '';
    document.getElementById('supPhone').value = '';
    document.getElementById('supDebt').value = '0';
}

function renderSuppliersTable() {
    const tbody = document.getElementById('suppliersTableBody');
    if(!tbody) return;

    if(suppliers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#888;">لا يتوفر مكاتب أو موردين مسجلين حالياً.</td></tr>`;
        return;
    }

    tbody.innerHTML = suppliers.map(s => `
        <tr>
            <td><strong>${s.name}</strong><br><small style="color:#666;">مذخر/شركة: ${s.company || '-'}</small></td>
            <td>${s.phone || '-'}</td>
            <td><b style="color:${s.debt > 0 ? '#ff3f34':'#05c46b'}">${s.debt.toLocaleString()} د.ع</b></td>
            <td>
                <button onclick="payPartialSupplierDebt('${s.id}')" class="btn-table-edit" style="background:#05c46b;"><i class="fas fa-hand-holding-usd"></i> دفع جزء/كل</button>
                <button onclick="deleteSupplier('${s.id}')" class="btn-table-delete"><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>
    `).join('');
}

// ======================== أقساط الزبائن والتحصيل الجزئي ========================
function renderDebtsTable() {
    const tbody = document.getElementById('debtsTableBody');
    if(!tbody) return;

    const activeDebts = sales.filter(s => s.remaining > 0);

    if(activeDebts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#888;">لا توجد ديون أو أقساط زبائن غير مسددة.</td></tr>`;
        return;
    }

    tbody.innerHTML = activeDebts.map(s => `
        <tr>
            <td><strong>${s.invoiceId}</strong></td>
            <td><b>${s.customerName}</b></td>
            <td>${s.total.toLocaleString()}</td>
            <td>${s.paid.toLocaleString()}</td>
            <td><b style="color:#ff3f34;">${s.remaining.toLocaleString()} د.ع</b></td>
            <td>
                <button onclick="collectPartialDebt('${s.invoiceId}')" class="btn-table-edit" style="background:#05c46b;"><i class="fas fa-money-bill-alt"></i> قبض قسط مالي</button>
            </td>
        </tr>
    `).join('');
}

function collectPartialDebt(invoiceId) {
    const inv = sales.find(s => s.invoiceId === invoiceId);
    if(!inv) return;

    const amount = prompt(`أدخل مبلغ القسط الواصل من الزبون: ${inv.customerName} (المتبقي الكلي: ${inv.remaining} د.ع)`);
    const val = parseFloat(amount);

    if(isNaN(val) || val <= 0) { showNotification("إدخال مالي خاطئ ومرفوض هندسياً!", "error"); return; }
    if(val > inv.remaining) { showNotification("المبلغ المقبوض يتجاوز إجمالي الدين المتبقي بالفاتورة!", "error"); return; }

    inv.paid += val;
    inv.remaining -= val;
    if(inv.remaining === 0) inv.type = "نقدي (تم استيفاء كامل الأقساط)";

    localStorage.setItem('sys_sales', JSON.stringify(sales));
    showNotification(`تم تقييد القسط بنجاح وتسجيل ${val.toLocaleString()} د.ع في الصندوق الحسابي العام.`, "success");
    renderDebtsTable();
    updateDashboardStats();
}

// ======================== لوحة الأرباح والمراقبة الفورية للجودة والتنبيهات ========================
function checkStockAlerts() {
    const alertList = document.getElementById('dashboardNotifications');
    if(!alertList) return;

    const critical = products.filter(p => p.qty <= (p.minQty || 5));
    if(critical.length === 0) {
        alertList.innerHTML = `<li style="color:#05c46b; font-weight:600;"><i class="fas fa-check-double"></i> مستويات الجرد بالكامل ممتازة وأعلى من حد الخطر.</li>`;
        return;
    }

    alertList.innerHTML = critical.map(p => `
        <li style="color:var(--danger-color); font-weight:600; padding:6px 0; border-bottom:1px dashed #eee;">
            <i class="fas fa-exclamation-triangle"></i> نقص جرد: [ ${p.name} ] المتبقي هو (<b>${p.qty}</b> قطعة فقط). الموقع التفصيلي: ممر ${p.aisle || '-'} رف ${p.shelf || '-'}.
        </li>
    `).join('');
}

function updateDashboardStats() {
    if(document.getElementById('statTotalItems')) document.getElementById('statTotalItems').innerText = products.length;

    // المبيعات النقدية الحقيقية المقبوضة فعلياً بالصندوق اليوم
    const totalCashCollected = sales.reduce((sum, s) => sum + s.paid, 0);
    if(document.getElementById('statTotalSales')) document.getElementById('statTotalSales').innerText = totalCashCollected.toLocaleString() + " د.ع";

    // ديون العملاء الإجمالية في السوق لنا
    const totalDebtsOut = sales.reduce((sum, s) => sum + s.remaining, 0);
    if(document.getElementById('statTotalDebts')) document.getElementById('statTotalDebts').innerText = totalDebtsOut.toLocaleString() + " د.ع";

    // حساب صافي الأرباح الحقيقي المتوقع بالمستودع بناء على معادلة الهندسة المالية: (سعر البيع - سعر الشراء) * الكمية
    const netProfit = products.reduce((sum, p) => sum + ((p.price - p.cost) * p.qty), 0);
    if(document.getElementById('statNetProfit')) document.getElementById('statNetProfit').innerText = netProfit.toLocaleString() + " د.ع";
}

function renderSalesTable() {
    const tbody = document.getElementById('salesTableBody');
    if(!tbody) return;

    if(sales.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#888;">أرشيف الفواتير فارغ من الحركات المالية.</td></tr>`;
        return;
    }

    tbody.innerHTML = sales.map(s => `
        <tr>
            <td><strong>${s.invoiceId}</strong><br><small style="color:#57606f;">الزبون: ${s.customerName}</small></td>
            <td><small>${s.date}</small></td>
            <td><span class="badge-cat" style="background:${s.remaining > 0 ? 'var(--orange-color)':'var(--accent-color)'}; color:white;">${s.type}</span></td>
            <td><b>${s.total.toLocaleString()} د.ع</b></td>
            <td>
                <button class="btn-table-edit" onclick="printSingleInvoice('${s.invoiceId}')"><i class="fas fa-print"></i></button>
                <button class="btn-table-edit" style="background:#57606f;" onclick="viewInvoiceItems('${s.invoiceId}')"><i class="fas fa-eye"></i></button>
            </td>
        </tr>
    `).join('');
}

function viewInvoiceItems(invoiceId) {
    const inv = sales.find(s => s.invoiceId === invoiceId);
    if(!inv) return;

    let html = `
        <p style="margin-bottom:10px;"><b>الزبون:</b> ${inv.customerName} | <b>التاريخ:</b> ${inv.date}</p>
        <table class="responsive-table">
            <thead><tr><th>المادة</th><th>الكمية المباعة</th><th>سعر البيع مفرد</th></tr></thead>
            <tbody>
                ${inv.items.map(i => `<tr><td>${i.name}</td><td>${i.itemQty} قطعة</td><td>${i.price.toLocaleString()} د.ع</td></tr>`).join('')}
            </tbody>
        </table>
    `;
    showDetailsModal(`تفاصيل ومحتوى الفاتورة ${invoiceId}`, html);
}

function printSingleInvoice(invoiceId) {
    const inv = sales.find(s => s.invoiceId === invoiceId);
    if(!inv) return;

    let itemsHtml = inv.items.map(i => `<tr><td>${i.name}</td><td>${i.itemQty}</td><td>${i.price.toLocaleString()} د.ع</td></tr>`).join('');
    let pWin = window.open('', '_blank');
    pWin.document.write(`
        <html dir="rtl"><head><title>فاتورة ${inv.invoiceId}</title><style>body{font-family:sans-serif;padding:20px;text-align:right;}table{width:100%;border-collapse:collapse;margin-top:15px;}th,td{border:1px solid #aaa;padding:8px;text-align:right;}</style></head>
        <body>
            <h2>وصل البيع والطلب المالي</h2><p><b>رقم الوصل:</b> ${inv.invoiceId}</p><p><b>العميل:</b> ${inv.customerName}</p><p><b>نوع الفاتورة الحسابية:</b> ${inv.type}</p><p><b>التاريخ:</b> ${inv.date}</p>
            <table><thead><tr><th>المادة</th><th>الكمية</th><th>السعر</th></tr></thead><tbody>${itemsHtml}</tbody></table>
            <h3 style="margin-top:15px;">المجموع الإجمالي: ${inv.total.toLocaleString()} د.ع</h3>
            <h3>المبلغ الواصل (النقدي): ${inv.paid.toLocaleString()} د.ع</h3>
            <h3 style="color:red;">الدين المتبقي للتحصيل: ${inv.remaining.toLocaleString()} د.ع</h3>
            <script>window.print(); window.close();</script>
        </body></html>
    `);
    pWin.document.close();
}

function printInventory() {
    if(products.length === 0) { showNotification("لا يتوفر جرد حالي لطباعته!", "error"); return; }
    let rows = products.map(p => `<tr><td>${p.name}</td><td>${p.category || 'عام'}</td><td>ممر:${p.aisle || '-'} / رف:${p.shelf || '-'}</td><td>${p.qty} قطعة</td><td>${p.price.toLocaleString()} د.ع</td></tr>`).join('');
    let pWin = window.open('', '_blank');
    pWin.document.write(`
        <html dir="rtl"><head><title>كشف وجرد المخازن</title><style>body{font-family:sans-serif;padding:20px;}table{width:100%;border-collapse:collapse;margin-top:15px;}th,td{border:1px solid #000;padding:8px;text-align:right;}th{background:#f1f2f6;}</style></head>
        <body><h2>تقرير كشف الجرد والرفوف الفعلي بالمستودع الرئيسي</h2><p>التاريخ: ${new Date().toLocaleDateString('ar-EG')}</p>
        <table><thead><tr><th>اسم المادة</th><th>التصنيف</th><th>موقع الرف والممر</th><th>الكمية الحالية المتوفرة</th><th>سعر البيع للجمهور</th></tr></thead><tbody>${rows}</tbody></table>
        <script>window.print(); window.close();</script></body></html>
    `);
    pWin.document.close();
}
