if ("serviceWorker" in navigator && "SyncManager" in window) {
    navigator.serviceWorker.ready.then((registration) => {
        document.getElementById("submitData").addEventListener("click", async () => {
            const data = { message: "this is an offline message!" };
            
            await addToQueue(data); // idxdb.js
            await registration.sync.register("sync-data");

            console.log("data saved for bg sync.");
        });
    });
} else {
    console.log("bg sync not supported");
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

// native api

document.addEventListener("DOMContentLoaded", () => {
    const toggleCameraButton = document.getElementById("toggleCamera");
    const togglePhotoButton = document.getElementById("togglePhoto");
    const videoElement = document.getElementById("videoStream");
    const canvasElement = document.getElementById("photoCanvas");
    const ctx = canvasElement.getContext("2d");

    let videoStream = null;
    let photoTaken = false;

    // open/close camera
    toggleCameraButton.addEventListener("click", async () => {
        if (!videoStream) {
            try {
                videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoElement.srcObject = videoStream;
                toggleCameraButton.textContent = "close camera";
                togglePhotoButton.disabled = false; // capture button on
            } catch (error) {
                console.error("camera error:", error);
            }
        } else {
            videoStream.getTracks().forEach(track => track.stop()); // stop video
            videoElement.srcObject = null;
            videoStream = null;
            toggleCameraButton.textContent = "open camera";
            togglePhotoButton.disabled = true; // capture button off
        }
    });

    // photo capture on/off
    togglePhotoButton.addEventListener("click", () => {
        if (!videoStream) {
            console.error("camera not active");
            return;
        }

        if (!photoTaken) {
            // take photo
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;
            ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
            togglePhotoButton.textContent = "remove photo";
            photoTaken = true;
        } else {
            // remove photo
            ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
            togglePhotoButton.textContent = "take photo";
            photoTaken = false;
        }
    });
});
