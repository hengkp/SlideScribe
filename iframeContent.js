(function () {
    let frameId = generateId(20);
    let canvasList = [];

    function updateCanvasList() {
        let newCanvases = getAllCanvases(document);
        newCanvases.forEach(canvas => {
            if (!canvasList.some(existingCanvas => existingCanvas.id === canvas.id)) {
                canvasList.push(canvas);
                console.log("New canvas detected:", canvas);
                console.log("Current canvas list:", canvasList);
            }
        });
        window.parent.postMessage({ canvasInfoList: canvasList }, '*');
    }

    function getAllCanvases(doc) {
        return Array.from(doc.getElementsByTagName("canvas")).filter(canvas => !isTainted(canvas)).map((canvas, index) => {
            return {
                frameId: frameId,
                index: index,
                id: canvas.id,
                dataURL: canvas.toDataURL("image/png", 1)
            };
        });
    }

    function dec2hex(dec) {
        return ('0' + dec.toString(16)).substr(-2);
    }

    function generateId(len) {
        let arr = new Uint8Array((len || 40) / 2);
        window.crypto.getRandomValues(arr);
        return Array.from(arr, dec2hex).join('');
    }

    function isTainted(canvas) {
        try {
            let context = canvas.getContext("2d", { willReadFrequently: true });
            let pixel = context.getImageData(0, 0, 1, 1);
            return false;
        } catch (err) {
            return (err.code === 18);
        }
    }

    function sendCanvasInfo() {
        let list = getAllCanvases(document);
        window.parent.postMessage({ canvasInfoList: list }, '*');
    }

    window.addEventListener('message', (event) => {
        if (event.data && event.data.command === 'GET_CANVAS_INFO_LIST') {
            sendCanvasInfo();
        }
    });

    window.addEventListener('load', sendCanvasInfo);

    const observer = new MutationObserver((mutations) => {
        sendCanvasInfo();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    console.log("Iframe content script loaded and running.");
})();