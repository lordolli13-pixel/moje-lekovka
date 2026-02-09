const CACHE_NAME = 'lekovka-v7';

self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));

// Interval běží každých 15 sekund
setInterval(async () => {
    const n = new Date();
    const ted = n.getHours().toString().padStart(2, '0') + ":" + n.getMinutes().toString().padStart(2, '0');
    const dJmeno = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"][n.getDay()];
    const dCislo = n.getDate();

    // Načtení dat z IndexedDB
    const request = indexedDB.open("LekovkaDB", 1);
    request.onsuccess = (e) => {
        const db = e.target.result;
        const tx = db.transaction("LekyStore", "readonly");
        const store = tx.objectStore("LekyStore");
        const getReq = store.get("aktualni_leky");

        getReq.onsuccess = () => {
            const leky = getReq.result || [];
            leky.forEach(l => {
                let okDnes = (!l.rezim && (l.dny.length === 0 || l.dny.includes(dJmeno))) || 
                             (l.rezim === 'liche' && dCislo % 2 !== 0) || 
                             (l.rezim === 'sude' && dCislo % 2 === 0);

                if (okDnes && l.casy.includes(ted)) {
                    // Unikátní klíč pro tuto minutu, aby nepípala 4x za minutu
                    const notifKey = `notif-${l.id}-${ted}-${n.toLocaleDateString()}`;
                    
                    // Zkontrolujeme, zda už tato notifikace nebyla zobrazena
                    self.registration.getNotifications({tag: notifKey}).then(notifications => {
                        if (notifications.length === 0) {
                            self.registration.showNotification("PŘIPOMÍNKA: " + l.nazev, {
                                body: `Čas užít lék (${ted}). Dávka: ${l.davka} ks.`,
                                icon: 'icon-192.png',
                                vibrate: [500, 200, 500],
                                tag: notifKey,
                                requireInteraction: true,
                                data: { url: self.registration.scope }
                            });
                        }
                    });
                }
            });
        };
    };
}, 15000);

self.addEventListener('notificationclick', (e) => {
    e.notification.close();
    e.waitUntil(clients.openWindow(e.notification.data.url));
});
