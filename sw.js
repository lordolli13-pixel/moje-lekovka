let lekyData = [];
let odeslano = new Set();

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'UPDATE_MEDS') {
        lekyData = event.data.leky;
    }
});

function hlidac() {
    const n = new Date();
    const ted = n.getHours().toString().padStart(2, '0') + ":" + n.getMinutes().toString().padStart(2, '0');
    const dJmeno = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"][n.getDay()];
    const dCislo = n.getDate();
    const dnes = n.toLocaleDateString();

    lekyData.forEach(l => {
        let ok = (!l.rezim && (l.dny.length === 0 || l.dny.includes(dJmeno))) || 
                 (l.rezim === 'liche' && dCislo % 2 !== 0) || 
                 (l.rezim === 'sude' && dCislo % 2 === 0);

        if (ok && l.casy.includes(ted)) {
            const klic = `${l.id}_${ted}_${dnes}`;
            if (!odeslano.has(klic)) {
                self.registration.showNotification("💊 Čas na lék: " + l.nazev, {
                    body: `Dávka: ${l.davka}. Nezapomeňte si vzít léky.`,
                    tag: klic,
                    renotify: true,
                    vibrate: [500, 110, 500]
                });
                odeslano.add(klic);
            }
        }
    });
}

setInterval(hlidac, 30000);

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));
