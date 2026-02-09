let lekyProKontrolu = [];
let posledniNotifikace = {}; // Paměť, aby to nepípalo každou sekundu ve stejnou minutu

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'UPDATE_MEDS') {
        lekyProKontrolu = event.data.leky;
        console.log('SW: Seznam léků aktualizován pro pozadí');
    }
});

// Tato funkce běží v SW na pozadí
function kontrolaCasu() {
    const n = new Date();
    const ted = n.getHours().toString().padStart(2, '0') + ":" + n.getMinutes().toString().padStart(2, '0');
    const dJmeno = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"][n.getDay()];
    const dCislo = n.getDate();
    const dnesniDatum = n.toLocaleDateString();

    lekyProKontrolu.forEach(l => {
        // Kontrola, zda je dnes správný den (režim nebo dny v týdnu)
        let ok = (!l.rezim && (l.dny.length === 0 || l.dny.includes(dJmeno))) || 
                 (l.rezim === 'liche' && dCislo % 2 !== 0) || 
                 (l.rezim === 'sude' && dCislo % 2 === 0);
        
        if (ok && l.casy.includes(ted)) {
            const idNotifikace = `${l.id}_${ted}_${dnesniDatum}`;
            
            // Pošli notifikaci jen pokud jsme ji v tuto minutu ještě neposlali
            if (!posledniNotifikace[idNotifikace]) {
                self.registration.showNotification("Čas na lék: " + l.nazev, {
                    body: `Dávka: ${l.davka} ks. Nezapomeňte na své léky!`,
                    icon: 'icon-192.png', // nahraď svou ikonou pokud máš
                    badge: 'icon-192.png',
                    tag: idNotifikace, // zabrání duplicitám v liště
                    renotify: true,
                    vibrate: [200, 100, 200]
                });
                posledniNotifikace[idNotifikace] = true;
            }
        }
    });
}

// Spustit kontrolu každých 30 sekund
setInterval(kontrolaCasu, 30000);

// Nutné pro aktivaci SW ihned po registraci
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});
