const CACHE_NAME = 'dijlah-v2';

// الملفات الأساسية التي يتم حفظها في الذاكرة للعمل بدون إنترنت
const ASSETS_TO_CACHE = [
    'index.html',
    'db.js',
    'barcode.js',
    'manifest.json',
    'Features.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://unpkg.com/dexie@latest/dist/dexie.js',
    'https://unpkg.com/html5-qrcode',
    'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js'
];

// 1. مرحلة التثبيت: حفظ الملفات في الكاش الجديد
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('جاري حفظ ملفات النظام في الكاش الجديد...');
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => self.skipWaiting()) // إجبار السيرفس وركر الجديد على التنشيط فوراً
    );
});

// 2. مرحلة التفعيل: حذف الكاش القديم (v1) تماماً من الهاتف
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('تم حذف الكاش القديم بنجاح:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim()) // فرض السيطرة على التطبيق فوراً بدون إعادة تشغيل
    );
});

// 3. جلب الملفات: تشغيل التطبيق من الذاكرة بسرعة وبدون إنترنت
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // إذا كان الملف موجوداً في الكاش نرجعه، وإلا نجابه من الإنترنت
            return response || fetch(event.request);
        })
    );
});

