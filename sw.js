const CACHE_NAME = 'lekovka-v6';

// 1. Instalace a aktivace
self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(clients.claim());
});

// 2. Funkce pro načtení léků z IndexedDB
async function getLekyFromDB() {
    return new Promise((resolve) => {
        const request = indexedDB.open("LekovkaDB", 1);
        request.onsuccess = (e) => {
            const db = e.target.result;
            try {
                const tx = db.transaction("LekyStore", "readonly");
                const store = tx.objectStore("LekyStore");
                const getReq = store.get("aktualni_leky");
                getReq.onsuccess = () => resolve(getReq.result || []);
                getReq.onerror = () => resolve([]);
            } catch (err) {
                resolve([]);
            }
        };
        request.onerror = () => resolve([]);
    });
}

// 3. Smyčka pro kontrolu času (běží na pozadí)
let posledniMinuta = "";

setInterval(async () => {
    const n = new Date();
    const ted = n.getHours().toString().padStart(2, '0') + ":" + n.getMinutes().toString().padStart(2, '0');
    
    // Kontrola, aby se v rámci jedné minuty neposlalo víc notifikací
    if (ted === posledniMinuta) return;
    posledniMinuta = ted;

    const dJmeno = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"][n.getDay()];
    const dCislo = n.getDate();
    const leky = await getLekyFromDB();

    leky.forEach(l => {
        // Kontrola dne (tvá logika: dny v týdnu / liché-sudé / každý den)
        let okDnes = (!l.rezim && (l.dny.length === 0 || l.dny.includes(dJmeno))) || 
                     (l.rezim === 'liche' && dCislo % 2 !== 0) || 
                     (l.rezim === 'sude' && dCislo % 2 === 0);

        if (okDnes && l.casy.includes(ted)) {
            self.registration.showNotification("Čas na lék: " + l.nazev, {
                body: `Dávka: ${l.davka} ks.`,
                icon: 'icon-192.png', // ujisti se, že máš tento soubor na serveru
                vibrate: [200, 100, 200],
                badge: 'icon-192.png',
                tag: `notif-${l.id}-${ted}`, // zamezí duplicitám
                renotify: true
            });
        }
    });
}, 30000); // Kontrola každých 30 vteřin

// 4. Obsluha kliknutí na notifikaci
self.addEventListener('notificationclick', (e) => {
    e.notification.close();
    e.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            if (clientList.length > 0) return clientList[0].focus();
            return clients.openWindow('./');
        })
    );
});

// 5. Příjem zpráv z hlavní aplikace (okamžitá aktualizace)
self.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'UPDATE_MEDS') {
        console.log("SW: Léky aktualizovány");
    }
});
