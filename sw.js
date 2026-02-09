let lekyProKontrolu = [];
let odeslaneNotifikace = new Set();

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'UPDATE_MEDS') {
        lekyProKontrolu = event.data.leky;
        console.log("SW: Data aktualizována", lekyProKontrolu.length);
    }
});

function kontrolaLeku() {
    if (lekyProKontrolu.length === 0) return;

    const n = new Date();
    const ted = n.getHours().toString().padStart(2, '0') + ":" + n.getMinutes().toString().padStart(2, '0');
    const dJmeno = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"][n.getDay()];
    const dCislo = n.getDate();
    const dnesniDatum = n.toLocaleDateString();

    lekyProKontrolu.forEach(l => {
        // Logika pro dny a režim (shodná s HTML)
        let ok = (!l.rezim && (l.dny.length === 0 || l.dny.includes(dJmeno))) || 
                 (l.rezim === 'liche' && dCislo % 2 !== 0) || 
                 (l.rezim === 'sude' && dCislo % 2 === 0);

        if (ok && l.casy.includes(ted)) {
            const idNotif = `${l.id}_${ted}_${dnesniDatum}`;
            
            if (!odeslaneNotifikace.has(idNotif)) {
                self.registration.showNotification("💊 Čas na lék: " + l.nazev, {
                    body: `Dávka: ${l.davka} ks. Nezapomeňte na své léky!`,
                    icon: 'icon-192.png',
                    badge: 'icon-192.png',
                    tag: idNotif,
                    renotify: true,
                    vibrate: [200, 100, 200]
                });
                odeslaneNotifikace.add(idNotif);
            }
        }
    });

    // Jednou za hodinu vyčistit paměť notifikací
    if (n.getMinutes() === 0) odeslaneNotifikace.clear();
}

setInterval(kontrolaLeku, 30000);

self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));
