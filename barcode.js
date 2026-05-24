// ==========================================
// محرك الباركود الاحترافي (Barcode Engine)
// ==========================================

const BarcodeEngine = {
    html5QrcodeScanner: null,

    // 1. توليد باركود وصورة لمنتج جديد برمجياً
    // لطباعته حرارياً أو عرضه في النظام
    generateBarcode(productId, elementId) {
        // يحتاج تضمين مكتبة JsBarcode في الـ HTML
        // <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        try {
            JsBarcode(`#${elementId}`, productId, {
                format: "CODE128", // النوع القياسي للمخازن والسوبرماركت
                lineColor: "#ffffff", // متوافق مع المظهر الداكن للبرنامج
                background: "transparent",
                width: 2,
                height: 60,
                displayValue: true // إظهار الرقم أسفل الخطوط
            });
        } catch (error) {
            console.error("فشل توليد الباركود:", error);
        }
    },

    // 2. تشغيل كاميرا الموبايل لقراءة الباركود فوراً عند البيع أو الجرد
    // يحتاج تضمين مكتبة html5-qrcode في الـ HTML
    // <script src="https://unpkg.com/html5-qrcode"></script>
    startScanner(elementContainerId, onScanSuccessCallback) {
        // تهيئة القارئ وتحديد حجم مربع الفحص
        this.html5QrcodeScanner = new Html5Qrcode(elementContainerId);
        
        const config = { 
            fps: 15, // عدد الإطارات في الثانية (سرعة المسح)
            qrbox: { width: 250, height: 150 } // مستطيل المسح الأفقي للباركود
        };

        // تشغيل الكاميرا الخلفية للموبايل تلقائياً (Environment Camera)
        this.html5QrcodeScanner.start(
            { facingMode: "environment" }, 
            config,
            async (decodedText, decodedResult) => {
                // عند نجاح القراءة:
                console.log(`تم رصد باركود: ${decodedText}`);
                
                // إيقاف الكاميرا مؤقتاً لتوفير البطارية ومنع التكرار
                await this.stopScanner();
                
                // تمرير الرقم المقروء للـ Callback لربطه بالمخزن
                onScanSuccessCallback(decodedText);
            },
            (errorMessage) => {
                // خطأ المسح المستمر (يمكن تجاهله لئلا يملأ الـ Console)
            }
        ).catch(err => {
            console.error("فشل تشغيل كاميرا الموبايل:", err);
            alert("يرجى إعطاء صلاحية استخدام الكاميرا للتطبيق.");
        });
    },

    // 3. إيقاف الكاميرا وإغلاقها
    async stopScanner() {
        if (this.html5QrcodeScanner) {
            await this.html5QrcodeScanner.stop();
            this.html5QrcodeScanner = null;
        }
    }
};

// ==========================================
// 4. الربط الذكي بين الباركود وقاعدة البيانات (IndexedDB)
// ==========================================
async function handleScannedProduct(barcode) {
    // البحث عن المنتج في الـ db.js الذي أنشأته
    const product = await db.products.get(barcode);
    
    if (product) {
        // إذا وجده، قم بإضافته فوراً لسلة المبيعات أو اعرض تفاصيله
        alert(`تم العثور على: ${product.name} | الكمية الإجمالية: ${Object.values(product.stocks).reduce((a, b) => a + b, 0)}`);
        // هنا تضع كود إضافة المادة للفاتورة
    } else {
        // إذا كان منتجاً جديداً، يفتح واجهة إضافة منتج ويربط الباركود به تلقائياً
        let name = prompt("منتج جديد! أدخل اسم المادة لتسجيلها محلياً:");
        if (name) {
            // حفظ المنتج في المخزن الرئيسي كمثال بداخل IndexedDB
            await AppDatabase.saveProduct(barcode, name, { wh_main: 1 }, 5);
            alert("تم تسجيل المادة بنجاح في المخزن محلياً.");
        }
    }
}

