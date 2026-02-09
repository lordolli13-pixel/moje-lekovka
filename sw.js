// Hlídač verze 7.0 - s vlastní pamětí
const DB_NAME = "LekovkaDB";
const STORE_NAME = "LekyStore";

function getLekyZPameti() {
    return new Promise((resolve) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (e) => {
            e.target.result.createObjectStore(STORE_NAME);
        };
        request.onsuccess = (e) => {
            const db = e.target.result;
            const transaction = db.transaction(STORE_NAME, "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const getReq = store.get("aktualni_leky");
            getReq.onsuccess = () => resolve(getReq.result || []);
        };
        request.onerror = () => resolve([]);
    });
}

async function hlidac() {
    const leky = await getLekyZPameti();
    if (!leky || leky.length === 0) return;

    const n = new Date();
    const ted = n.getHours().toString().padStart(2, '0') + ":" + n.getMinutes().toString().padStart(2, '0');
    const dJmeno = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"][n.getDay()];
    const dCislo = n.getDate();
    const dnes = n.toLocaleDateString();

    leky.forEach(l => {
        let ok = (!l.rezim && (l.dny.length === 0 || l.dny.includes(dJmeno))) || 
                 (l.rezim === 'liche' && dCislo % 2 !== 0) || 
                 (l.rezim === 'sude' && dCislo % 2 === 0);

        if (ok && l.casy.includes(ted)) {
            const klic = `notif_${l.id}_${ted}_${dnes}`;
            // Použijeme self.registration pro zobrazení
            self.registration.getNotifications({tag: klic}).then(existujici => {
                if (existujici.length === 0) {
                    self.registration.showNotification("💊 Čas na lék: " + l.nazev, {
                        body: `Dávka: ${l.davka}. Prosím, vezměte si svůj lék.`,
                        tag: klic,
                        icon: 'icon-192.png',
                        badge: 'icon-192.png',
                        vibrate: [500, 200, 500],
                        requireInteraction: true,
                        data: { url: self.registration.scope }
                    });
                }
            });
        }
    });
}

// Kontrola každých 30 vteřin
setInterval(hlidac, 30000);

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));

// Reakce na kliknutí na notifikaci - otevře aplikaci
self.addEventListener('notificationclick', (e) => {
    e.notification.close();
    e.waitUntil(clients.openWindow(e.notification.data.url));
});
