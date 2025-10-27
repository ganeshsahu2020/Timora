// public/sw.js
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data.json(); } catch { data = { title: 'Reminder', body: '' }; }

  const title = data.title || 'Reminder';
  const options = {
    body: data.body || '',
    data: data.data || {},
    icon: '/icons/icon-192.png',          // optional
    badge: '/icons/badge-72.png'          // optional
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = '/reminders'; // deep link target
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      const hadWindow = clientsArr.some((w) => (w.url.includes(url) ? (w.focus(), true) : false));
      if (!hadWindow) clients.openWindow(url);
    })
  );
});
