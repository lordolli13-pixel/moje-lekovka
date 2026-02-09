let alarmTime = null;

// Příjem času z aplikace
self.addEventListener('message', (event) => {
    if (event.data.type === 'SET_ALARM') {
        alarmTime = event.data.time;
        console.log('SW: Budík nastaven na ' + alarmTime);
    }
});

// Kontrola času každých 10 sekund
setInterval(() => {
    if (!alarmTime) return;

    const n = new Date();
    // Formát HH:mm v českém čase
    const ted = n.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });

    console.log('SW kontrola: ' + ted + ' vs ' + alarmTime);

    if (ted === alarmTime) {
        self.registration.showNotification("BUDÍK!", {
            body: "Čas vypršel: " + alarmTime,
            vibrate: [500, 200, 500, 200, 500],
            requireInteraction: true, // Notifikace nezmizí sama
            tag: 'test-alarm' // Zamezí duplicitám
        });
        alarmTime = null; // Po pípnutí budík smažeme
    }
}, 10000);
