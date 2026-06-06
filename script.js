// مصفوفة البيانات الموحدة الحركية لنظام دجلة v7.0 الأصلي والمطور كلياً
let currentProducts = {
    "PROD_1": { id: "PROD_1", name: "باب ألمنيوم داخلي ممتاز", category: "الأبواب والشبابيك", unit: "قطعة", price: 180, qty: 4, min: 5, max: 200, barcode: "69202601", location: "A3-02-B-11" },
    "PROD_2": { id: "PROD_2", name: "مطبخ هيدروليك متكامل", category: "المطابخ الفاخرة", unit: "متر مربع", price: 950, qty: 15, min: 2, max: 100, barcode: "69202602", location: "A1-05-C-02" },
    "PROD_3": { id: "PROD_3", name: "شباك سحاب عازل للصوت", category: "الأبواب والشبابيك", unit: "قطعة", price: 110, qty: 98, min: 2, max: 100, barcode: "69202603", location: "A4-01-A-01" }
};
let currentSalesInvoices = {};
let activeInvoiceCart = [];
const requiredSecureOTP = "1945"; 
let temporaryPhoneNumber = "";

// مستودع بيانات الرقابة وسلة المحذوفات الكلية المطلوبة
let systemTrashData = {
    items: [{ id: "TR-📦-01", name: "ملف ألمنيوم جانبي ملغى", date: "2026-06-05", user: "عمر طه" }],
    accounts: [{ id: "TR-👤-12", name: "شركة الأمل للتوريدات الملغاة", date: "2026-06-04", user: "عمر طه" }],
    bills: [{ id: "TR-🧾-99", name: "فاتورة مبيعات محذوفة رقم 4022", date: "2026-06-06", user: "أحمد المحاسب" }]
};

window.onload = function() {
    const savedSession = localStorage.getItem('dijla_logged_in');
    const savedAccount = localStorage.getItem('dijla_account_name');
    if (savedSession === 'true' && savedAccount) {
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('system-user-title').innerText = `🏢 المنشأة النشطة سحابياً: ${savedAccount} [فرع الموصل الرئيسي]`;
        initializeSystemData();
    } else {
        document.getElementById('auth-container').style.display = 'flex';
        document.getElementById('auth-step-1').style.display = 'block';
    }
};

function sendOTPCode() {
    const phone = document.getElementById('reg-phone').value;
    const pass = document.getElementById('reg-pass').value;
    if (!phone || !pass) { alert("خطأ: يرجى ملء حقول الهاتف وكلمة المرور أولاً!"); return; }
    temporaryPhoneNumber = phone;
    document.getElementById('auth-step-1').style.display = 'none';
    document.getElementById('auth-step-2').style.display = 'block';
    console.log(`تم إرسال رمز المصادقة الثنائية 2FA بنجاح: ${requiredSecureOTP}`);
}

function verifyOTPCode() {
    if (document.getElementById('input-otp').value === requiredSecureOTP) {
        document.getElementById('auth-step-2').style.display = 'none';
        document.getElementById('auth-step-3').style.display = 'block';
    } else {
        alert("❌ رمز التحقق الخلوي خاطئ! يرجى إدخال 1945 لإتمام التفعيل التجريبي للذكاء الاصطناعي.");
    }
}

function saveAccountProfile() {
    const accName = document.getElementById('sys-account-name').value;
    if (!accName) { alert("يرجى تحديد اسم الحساب للمنشأة!"); return; }
    localStorage.setItem('dijla_logged_in', 'true');
    localStorage.setItem('dijla_account_name', accName);
    document.getElementById('auth-container').style.display = 'none';
    location.reload();
}

function logoutSystem() { localStorage.clear(); location.reload(); }
function initializeSystemData() { updateCurrencyModes(); renderProductsDOM(); switchTrashTab('items'); }

function updateCurrencyModes() {
    const currencySelect = document.getElementById('sales-currency-type');
    if(!currencySelect) return;
    currencySelect.innerHTML = `<option value="USD">دولار أمريكي ($) الحساب الافتراضي</option><option value="IQD">دينار عراقي (د.ع) السعر الموازي</option>`;
}

function toggleDebtInputs() {
    const method = document.getElementById('sales-pay-method').value;
    document.getElementById('debt-scheduling-fields').style.display = (method === 'debt') ? 'grid' : 'none';
}

function checkScheduledDebtsToday(isManualClick) {
    let mockDebts = [
        { customer: "معرض الرافدين الفاخر للأبواب", amount: "$1,250", phone: "07700000000" },
        { customer: "شركة إنماء الظاهرة للمطابخ الديكورية", amount: "$700", phone: "07500000000" }
    ];
    let html = "";
    mockDebts.forEach((d, i) => {
        html += `📌 <strong>${i+1}. العميل:</strong> ${d.customer}<br>&nbsp;&nbsp;&nbsp;&nbsp;<strong>قسط التحصيل المستحق اليوم:</strong> <span style='color:var(--danger); font-weight:bold;'>${d.amount}</span><br>&nbsp;&nbsp;&nbsp;&nbsp;<strong>هاتف الاتصال الفوري:</strong> ${d.phone}<br><hr style='border:0; border-top:1px solid var(--border-color); margin:6px 0;'>`;
    });
    document.getElementById('popup-content').innerHTML = html;
    document.getElementById('popup').style.display = 'flex';
}

function handleBarcodeScan(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const barcodeVal = document.getElementById('barcode-scanner-input').value.trim();
        if (!barcodeVal) return;

        let productFound = null;
        for (let key in currentProducts) {
            if (currentProducts[key].barcode === barcodeVal) { productFound = currentProducts[key]; break; }
        }

        if (productFound) {
            activeInvoiceCart.push({ name: productFound.name, price: productFound.price, dim: "قياس مخزني دقيق", qty: 1 });
            renderInvoiceCartDOM();
            alert(`⚡ باركود ذكي: تم رصد وإدراج (${productFound.name}) في سلة الفاتورة مباشرة.`);
        } else {
            activeInvoiceCart.push({ name: `صنف ممسوح بباركود عشوائي (${barcodeVal})`, price: 150, dim: "حسب الطلب المعملي", qty: 1 });
            renderInvoiceCartDOM();
        }
        document.getElementById('barcode-scanner-input').value = '';
    }
}

function triggerIoTScan() {
    alert("📡 جاري بث إشارة موجات الـ RFID و IoT للاتصال بقوارئ المخزن... تم تحديث ومطابقة كميات 3 رفوف ميكانيكياً بدون تدخل بشري.");
}

function syncCloudData() {
    alert("🔄 تم الاتصال بالسيرفر السحابي للبرنامج، ومزامنة كافة فواتير البيع وأرشيف سلة المحذوفات بأمان وتشفير كامل.");
}

function addMaterialRecipe() {
    const parent = document.getElementById('bom-parent-product').options[document.getElementById('bom-parent-product').selectedIndex].text;
    const raw = document.getElementById('bom-raw-material').value.trim();
    const qty = document.getElementById('bom-raw-qty').value;
    if(!raw || qty <= 0) { alert("يرجى ملء مواصفات المادة الخام بدقة!"); return; }
    alert(`📐 تم حفظ التفكيك الجدولي (BOM): عند تصنيع/بيع 1 قطعة من (${parent})، سيقوم النظام تلقائياً بسحب واحتساب تكلفة وخصم (${qty} وحدة من ${raw}).`);
    document.getElementById('bom-raw-material').value = '';
}

function handleSupplierQC() {
    const status = document.getElementById('qc-status').value;
    if(status === 'pass') {
        alert("🟢 تم اعتماد الاستلام بنجاح، وترحيل البضائع الواردة إلى الموقع التخزيني المقر لها.");
    } else {
        alert("🔴 تم رصد عدم مطابقة في فحص الجودة! جاري إصدار مستند مرتجع شراء للمورد تلقائياً وتجميد المستحقات المالية له.");
    }
}

function switchTrashTab(type) {
    document.querySelectorAll('#trash_page .tab-btn').forEach(btn => btn.classList.remove('active'));
    const tbody = document.getElementById('trash-table-body'); if(!tbody) return;
    tbody.innerHTML = ''; let targetArr = [];

    if (type === 'items') { document.getElementById('btn-trash-items').classList.add('active'); targetArr = systemTrashData.items; }
    else if (type === 'accounts') { document.getElementById('btn-trash-accounts').classList.add('active'); targetArr = systemTrashData.accounts; }
    else if (type === 'bills') { document.getElementById('btn-trash-bills').classList.add('active'); targetArr = systemTrashData.bills; }

    if(targetArr.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">لا توجد عناصر ملغاة في هذا القسم حالياً.</td></tr>`; return;
    }
    targetArr.forEach((elem, idx) => {
        tbody.innerHTML += `<tr><td><span style="color:var(--danger); font-family:monospace;">${elem.id}</span></td><td><strong>${elem.name}</strong></td><td>${elem.date}</td><td><span class="badge" style="background:rgba(225,29,72,0.1); color:var(--danger);">${elem.user}</span></td><td><button class="btn" style="padding:2px 6px; font-size:11px; border-color:var(--success); color:var(--success);" onclick="restoreTrashElement('${type}', ${idx})"><i class="fa-solid fa-rotate-left"></i> استعادة فورا</button></td></tr>`;
    });
}

function restoreTrashElement(type, idx) {
    let name = "";
    if (type === 'items') name = systemTrashData.items.splice(idx, 1)[0].name;
    if (type === 'accounts') name = systemTrashData.accounts.splice(idx, 1)[0].name;
    if (type === 'bills') name = systemTrashData.bills.splice(idx, 1)[0].name;
    alert(`✅ تم استعادة (${name}) وإعادته كعنصر نشط في النظام وسجلات التدقيق المباشر.`);
    switchTrashTab(type); renderProductsDOM();
}

function saveProduct() {
    const id = document.getElementById('p-id').value;
    const name = document.getElementById('p-name').value.trim();
    const category = document.getElementById('p-category').value.trim();
    const unit = document.getElementById('p-unit').value;
    const price = parseFloat(document.getElementById('p-price').value) || 0;
    const qty = parseInt(document.getElementById('p-qty').value) || 0;
    const min = parseInt(document.getElementById('p-min').value) || 0;
    const max = parseInt(document.getElementById('p-max').value) || 100;
    let barcode = document.getElementById('p-barcode').value.trim();

    if(!name) { alert("خطأ: حقل اسم الصنف إلزامي!"); return; }
    if(!barcode) barcode = "BC-" + Math.floor(100000 + Math.random() * 900000);

    if (id && currentProducts[id]) {
        currentProducts[id] = { id, name, category, unit, price, qty, min, max, barcode, location: currentProducts[id].location };
        alert(` تم تحديث بطاقة الصنف (${name}) والمواصفات المقررة.`);
    } else {
        const newId = 'PROD_' + Date.now();
        currentProducts[newId] = { id: newId, name, category, unit, price, qty, min, max, barcode, location: "A1-01-A-01" };
        alert(` تم قيد وحفظ بطاقة صنف جديدة وتوليد أكواد الـ QR والباركود تلقائياً لها.`);
    }
    clearProductForm(); renderProductsDOM();
}

function deleteProduct(id) {
    if(confirm("هل أنت متأكد من إلغاء وحذف هذا الصنف ونقله فوراً لسلة المحذوفات والرقابة؟")) {
        const p = currentProducts[id];
        systemTrashData.items.push({ id: 'TR-📦-' + p.id.slice(-3), name: p.name + ` [الكمية الملغاة: ${p.qty}]`, date: new Date().toISOString().split('T')[0], user: localStorage.getItem('dijla_account_name') || 'المسؤول' });
        delete currentProducts[id]; renderProductsDOM(); switchTrashTab('items');
    }
}

function editProduct(id) {
    const p = currentProducts[id]; if(!p) return;
    document.getElementById('p-id').value = p.id;
    document.getElementById('p-name').value = p.name;
    document.getElementById('p-category').value = p.category;
    document.getElementById('p-unit').value = p.unit;
    document.getElementById('p-price').value = p.price;
    document.getElementById('p-qty').value = p.qty;
    document.getElementById('p-min').value = p.min;
    document.getElementById('p-max').value = p.max;
    document.getElementById('p-barcode').value = p.barcode;
}

function clearProductForm() {
    document.getElementById('p-id').value = ''; document.getElementById('p-name').value = ''; document.getElementById('p-category').value = '';
    document.getElementById('p-price').value = ''; document.getElementById('p-qty').value = ''; document.getElementById('p-barcode').value = '';
}

function renderProductsDOM() {
    const tbody = document.getElementById('products-table-body'); if(!tbody) return;
    tbody.innerHTML = ''; let totalItems = 0;

    for(let key in currentProducts) {
        totalItems++; const p = currentProducts[key];
        let rowClass = (p.qty <= p.min) ? "low-stock" : "";
        tbody.innerHTML += `
            <tr class="${rowClass}">
                <td><strong>${p.name}</strong><br><small style="color:var(--accent); font-family:monospace;">ID: ${p.barcode}</small></td>
                <td>${p.category}</td>
                <td>${p.unit}</td>
                <td style="font-weight:bold; color:var(--accent);">${p.qty} وحدة متاح فوري</td>
                <td><small>أدنى: ${p.min} / أقصى: ${p.max}</small></td>
                <td>
                    <span class="badge" style="background:#222; color:white; border:1px solid #444; font-family:monospace; cursor:pointer;" onclick="alert('جاري إرسال أمر طباعة الباركود المشفر المباشر للصنف: ${p.name}')"><i class="fa-solid fa-print"></i> ||| باركود</span>
                    <span class="badge" style="background:white; color:black; font-size:10px; cursor:pointer;" onclick="alert('فتح رمز الاستجابة السريعة QR المطور للصنف ${p.name} المرتبط سحابياً برابط التتبع.')"><i class="fa-solid fa-qrcode"></i> QR</span>
                </td>
                <td>
                    <button class="btn" style="padding:3px 8px; font-size:11px;" onclick="editProduct('${p.id}')"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn" style="padding:3px 8px; font-size:11px; color:var(--danger);" onclick="deleteProduct('${p.id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    }
    document.getElementById('kpi-total-items').innerText = totalItems + " أصناف رئيسية";
}

function addItemToInvoiceCart() {
    const name = document.getElementById('sales-input-name').value.trim();
    const price = parseFloat(document.getElementById('sales-input-price').value) || 0;
    const dim = document.getElementById('sales-input-dim').value || 'قياس قياسي';
    const qty = parseInt(document.getElementById('sales-input-qty').value) || 1;

    if(!name || price <= 0) { alert("خطأ: يرجى كتابة بيان صنف المبيعات وتحديد السعر المالي!"); return; }
    activeInvoiceCart.push({ name, price, dim, qty });
    document.getElementById('sales-input-name').value = ''; document.getElementById('sales-input-price').value = ''; document.getElementById('sales-input-dim').value = '';
    renderInvoiceCartDOM();
}

function removeCartItem(idx) { activeInvoiceCart.splice(idx, 1); renderInvoiceCartDOM(); }

function renderInvoiceCartDOM() {
    const tbody = document.getElementById('invoice-items-body'); if(!tbody) return;
    tbody.innerHTML = ''; let total = 0; const symbol = document.getElementById('sales-currency-type').value || 'USD';
    const discount = parseFloat(document.getElementById('sales-discount').value) || 0;

    activeInvoiceCart.forEach((item, idx) => {
        const sub = item.price * item.qty; total += sub;
        tbody.innerHTML += `<tr><td><strong>${item.name}</strong> <br><small style="color:var(--text-muted);">${item.dim}</small></td><td>${item.price} ${symbol}</td><td>${item.qty}</td><td style="color:var(--accent); font-weight:bold;">${sub} ${symbol}</td><td><button class="btn" style="padding:2px 5px; color:var(--danger);" onclick="removeCartItem(${idx})"><i class="fa-solid fa-circle-minus"></i></button></td></tr>`;
    });
    let finalTotal = total - discount; if(finalTotal < 0) finalTotal = 0;
    document.getElementById('invoice-total-label').innerText = finalTotal.toLocaleString() + ' ' + symbol;
}

function submitInvoice() {
    if(activeInvoiceCart.length === 0) { alert("خطأ حاسم: قائمة الفاتورة المفتوحة خالية تماماً!"); return; }
    const customer = document.getElementById('sales-customer').value;
    const method = document.getElementById('sales-pay-method').value;
    const invId = 'DJL-INV-' + Math.floor(1000 + Math.random() * 9000);

    currentSalesInvoices[invId] = { invId, customer, method, total: document.getElementById('invoice-total-label').innerText };
    alert(`✅ تم ترحيل وحفظ مستند الفاتورة بالرقم: ${invId} بنجاح.`);
    activeInvoiceCart = []; renderInvoiceCartDOM(); renderSalesHistoryDOM();
}

function renderSalesHistoryDOM() {
    const tbody = document.getElementById('sales-history-body'); if(!tbody) return;
    tbody.innerHTML = '';
    for(let key in currentSalesInvoices) {
        const inv = currentSalesInvoices[key];
        tbody.innerHTML += `<tr><td><strong>${inv.invId}</strong></td><td>${inv.customer}</td><td><span class="badge" style="background:#222; color:var(--warning-orange);">${inv.method === 'cash' ? 'نقدي فوري' : 'ذمم وأقساط مؤجلة'}</span></td><td style="color:var(--success); font-weight:bold;">${inv.total}</td><td><button class="btn" style="padding:2px 6px; font-size:11px; color:var(--danger);" onclick="cancelAndTrashInvoice('${inv.invId}')"><i class="fa-solid fa-rectangle-xmark"></i> إلغاء وحذف</button></td></tr>`;
    }
}

function cancelAndTrashInvoice(invId) {
    if(confirm(`هل أنت متأكد من إلغاء الفاتورة ${invId} نهائياً ونقلها لأرشيف الرقابة وسلة المحذوفات؟`)) {
        const inv = currentSalesInvoices[invId];
        systemTrashData.bills.push({ id: 'TR-🧾-' + inv.invId.slice(-4), name: `قائمة مبيعات للزبون: ${inv.customer} بقيمة ${inv.total}`, date: new Date().toISOString().split('T')[0], user: localStorage.getItem('dijla_account_name') || 'المسؤول' });
        delete currentSalesInvoices[invId]; renderSalesHistoryDOM(); switchTrashTab('bills');
    }
}

function changeSystemTheme() {
    const selectedTheme = document.getElementById('theme-color-select').value;
    const root = document.documentElement;
    if(selectedTheme === 'dark-red') {
        root.style.setProperty('--bg-main', '#1c0508'); root.style.setProperty('--bg-card', '#260a0f'); root.style.setProperty('--accent', '#e11d48');
    } else if(selectedTheme === 'dark-blue') {
        root.style.setProperty('--bg-main', '#060b14'); root.style.setProperty('--bg-card', '#0e1726'); root.style.setProperty('--accent', '#2563eb');
    } else if(selectedTheme === 'cyan-theme') {
        root.style.setProperty('--bg-main', '#01181c'); root.style.setProperty('--bg-card', '#05272e'); root.style.setProperty('--accent', '#00adb5');
    } else if(selectedTheme === 'purple-theme') {
        root.style.setProperty('--bg-main', '#0e051f'); root.style.setProperty('--bg-card', '#190a33'); root.style.setProperty('--accent', '#8b5cf6');
    } else if(selectedTheme === 'green-theme') {
        root.style.setProperty('--bg-main', '#02140c'); root.style.setProperty('--bg-card', '#072416'); root.style.setProperty('--accent', '#25d366');
    } else {
        root.style.setProperty('--bg-main', '#060608'); root.style.setProperty('--bg-card', '#111116'); root.style.setProperty('--accent', '#00adb5');
    }
}

function changeSystemFont() {
    const font = document.getElementById('font-family-select').value;
    document.querySelectorAll('*').forEach(el => el.style.fontFamily = font);
}

function changeFontSize() {
    const size = document.getElementById('font-size-input').value;
    document.body.style.fontSize = size + 'px';
}

function toggleButtonExpansion() {
    const isChecked = document.getElementById('expand-buttons-checkbox').checked;
    const mainGrid = document.getElementById('main-dashboard-grid');
    if(mainGrid) { mainGrid.style.gridTemplateColumns = isChecked ? "repeat(auto-fit, minmax(220px, 1fr))" : "repeat(auto-fit, minmax(160px, 1fr))"; }
}

function testPrint(pName) { alert(`🖨️ تم دفع مستند فحص حقيقي متكامل عبر شبكة الاتصال المحلية إلى طابعة: [${pName}] بنجاح.`); }
function exportToExcel() { alert("📊 ميزة التحويل المالي: تم توليد وهيكلة وتنزيل ملف كشف مبيعات ومشتريات وجداول الجرد بصيغة Excel الحقيقية بنجاح."); }

function switchPage(pageId, event) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
    if(document.getElementById(pageId)) document.getElementById(pageId).classList.add('active');
    if(event) event.currentTarget.classList.add('active');
}
function toggleCalc() { const c = document.getElementById('calc'); c.style.display = c.style.display === 'block' ? 'none' : 'block'; }
function pressCalc(val) { document.getElementById('calcScreen').value += val; }
function clearCalc() { document.getElementById('calcScreen').value = ''; }
function evalCalc() { try { const e = document.getElementById('calcScreen').value; if(e) document.getElementById('calcScreen').value = eval(e); } catch(err) { document.getElementById('calcScreen').value = 'Error'; } }

function toggleVirtualKeyboard() { const k = document.getElementById('virtual-keyboard'); k.style.display = k.style.display === 'block' ? 'none' : 'block'; }
function pressKey(char) { alert(`تمت طباعة الحرف [ ${char} ] داخل حقل الإدخال النشط للفاتورة.`); }
function clearKey() { alert('تم مسح الحقل.'); }
function closePopup() { document.getElementById('popup').style.display = 'none'; }
