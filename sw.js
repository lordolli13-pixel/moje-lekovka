let targetTime = null;

self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));

self.addEventListener('message', (event) => {
    if (event.data.type === 'START_ALARM') {
        targetTime = event.data.time;
    }
});

setInterval(() => {
    const n = new Date();
    // Přesný formát HH:mm
    const h = n.getHours().toString().padStart(2, '0');
    const m = n.getMinutes().toString().padStart(2, '0');
    const ted = `${h}:${m}`;

    // Pošleme info zpět do HTML, že žijeme (uvidíš v "Poslední události")
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({ type: 'TICK', time: ted });
        });
    });

    if (targetTime && ted === targetTime) {
        self.registration.showNotification("BUDÍK FUNGUJE!", {
            body: `Je přesně ${ted}`,
            icon: 'https://cdn-icons-png.flaticon.com/512/182/182414.png',
            vibrate: [500, 100, 500, 100, 500],
            tag: 'alarm-v1',
            requireInteraction: true
        });
        targetTime = null; // Reset, aby to nepípalo celou minutu v kuse
    }
}, 10000); // Kontrola každých 10 sekund
