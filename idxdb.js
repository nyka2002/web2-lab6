function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("PWAStorage", 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("syncQueue")) {
                db.createObjectStore("syncQueue", { keyPath: "id", autoIncrement: true });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject("db error: " + event.target.errorCode);
    });
}

async function addToQueue(data) {
    const db = await openDB();
    const tx = db.transaction("syncQueue", "readwrite");
    tx.objectStore("syncQueue").add(data);
}

async function getQueuedData() {
    const db = await openDB();
    return new Promise((resolve) => {
        const tx = db.transaction("syncQueue", "readonly");
        const store = tx.objectStore("syncQueue");
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
    });
}

async function removeFromQueue(id) {
    const db = await openDB();
    const tx = db.transaction("syncQueue", "readwrite");
    tx.objectStore("syncQueue").delete(id);
}