if ("serviceWorker" in navigator && "SyncManager" in window) {
    navigator.serviceWorker.ready.then((registration) => {
        document.getElementById("submitData").addEventListener("click", async () => {
            const data = { message: "this is an offline message!" };
            
            await addToQueue(data); // idxdb.js
            await registration.sync.register("sync-data");

            console.log("Data saved for background sync.");
        });
    });
} else {
    console.log("Background Sync not supported");
}

let deferredPrompt;

window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;

    let installBtn = document.getElementById("btnInstall");
    installBtn.hidden = false; // Show button // show button

    installBtn.addEventListener("click", async () => {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            console.log("install prompt accepted");
        } else {
            console.log("install prompt dismissed");
        }
        deferredPrompt = null;
        installBtn.hidden = true; // hide button after pressed
    });
});