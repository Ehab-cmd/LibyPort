
const CACHE_NAME = 'libyport-cache-v7';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/react-dom@^19.2.0/client',
  'https://up6.cc/2025/10/176278012677161.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// الاستماع للرسائل الواردة من التطبيق (UI) لإظهار تنبيهات النظام
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const { title, body, url } = event.data;
        
        const options = {
            body: body,
            icon: 'https://up6.cc/2025/10/176278012677161.jpg',
            badge: 'https://up6.cc/2025/10/176278012677161.jpg',
            vibrate: [200, 100, 200],
            data: {
                url: url || '/'
            },
            actions: [
                { action: 'open', title: 'عرض التفاصيل' }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(title, options)
        );
    }
});

// معالج استقبال الإشعارات عبر الـ Push API (إذا تم ربطه بسيرفر خارجي مستقبلاً)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'LibyPort', body: 'لديك إشعار جديد في حسابك' };
  
  const options = {
    body: data.body,
    icon: 'https://up6.cc/2025/10/176278012677161.jpg',
    badge: 'https://up6.cc/2025/10/176278012677161.jpg',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// معالج النقر على الإشعار
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // إذا كان البرنامج مفتوحاً بالفعل، قم بالتركيز عليه وتحديث الرابط
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // إذا كان مغلقاً، افتحه في نافذة جديدة
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('fetch', event => {
  // تخطي طلبات Firestore
  if (event.request.url.includes('firestore.googleapis.com')) return;
  
  // استراتيجية Stale-While-Revalidate للملفات الثابتة
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        // تحديث الكاش بالنسخة الجديدة إذا كانت الاستجابة صالحة
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // في حالة فشل الشبكة، لا نفعل شيئاً، سيعود الـ cachedResponse
      });

      // ارجع النسخة المخبأة فوراً إذا وجدت، وإلا انتظر الشبكة
      return cachedResponse || fetchPromise;
    })
  );
});
