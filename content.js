(function () {
    const COMMANDS = {
        GET_CANVAS_INFO_LIST: "GET_CANVAS_INFO_LIST",
        GET_CANVAS_DATA: "GET_CANVAS_DATA",
    };

    let frameId = generateId(20);
    let canvasList = [];

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log("Content script received request:", request);
        switch (request.command) {
            case COMMANDS.GET_CANVAS_INFO_LIST:
                waitForLoad()
                    .then(async () => {
                        await updateCanvasList();
                        sendResponse({ canvasInfoList: canvasList });
                    })
                    .catch((err) => console.error(err));
                return true; // Indicate asynchronous response
            case COMMANDS.GET_CANVAS_DATA:
                if (request.data.frame === frameId) {
                    sendResponse({
                        dataURL: document
                            .getElementsByTagName("canvas")
                            [
                                request.data.index
                            ].toDataURL(request.data.type, 1),
                    });
                }
                break;
            default:
                break;
        }
        return true; // Indicate asynchronous response
    });

    async function updateCanvasList() {
        canvasList = getAllCanvases(document);
        console.log("Canvas info list:", canvasList);

        let iframes = Array.from(document.getElementsByTagName("iframe"));
        for (let iframe of iframes) {
            try {
                let iframeDoc =
                    iframe.contentDocument || iframe.contentWindow.document;
                if (iframeDoc) {
                    await injectScript(iframe);
                    await postMessageToIframe(iframe, {
                        command: "GET_CANVAS_INFO_LIST",
                    });
                }
            } catch (e) {
                console.error("Error accessing iframe:", e);
            }
        }
    }

    function getAllCanvases(doc) {
        let canvases = Array.from(doc.getElementsByTagName("canvas"))
            .filter((canvas) => !isTainted(canvas))
            .map((canvas, index) => {
                return {
                    frameId: frameId,
                    index: index,
                    id: canvas.id,
                    dataURL: canvas.toDataURL("image/png", 1),
                };
            });

        let uniqueCanvases = [];
        let canvasIDs = new Set();

        for (let canvas of canvases) {
            if (!canvasIDs.has(canvas.id)) {
                uniqueCanvases.push(canvas);
                canvasIDs.add(canvas.id);
            }
        }
        return uniqueCanvases;
    }

    async function injectScript(iframe) {
        return new Promise((resolve, reject) => {
            let script = document.createElement("script");
            script.src = chrome.runtime.getURL("inject.js");
            script.onload = resolve;
            script.onerror = reject;
            iframe.contentDocument.head.appendChild(script);
        });
    }

    async function postMessageToIframe(iframe, message) {
        return new Promise((resolve, reject) => {
            iframe.contentWindow.postMessage(message, "*");
            window.addEventListener("message", function handler(event) {
                if (
                    event.source === iframe.contentWindow &&
                    event.data &&
                    event.data.canvasInfoList
                ) {
                    window.removeEventListener("message", handler);
                    let newCanvases = event.data.canvasInfoList.filter(
                        (canvas) =>
                            !canvasList.some(
                                (existingCanvas) =>
                                    existingCanvas.id === canvas.id,
                            ),
                    );
                    canvasList = canvasList.concat(newCanvases);
                    resolve();
                }
            });
        });
    }

    function dec2hex(dec) {
        return ("0" + dec.toString(16)).substr(-2);
    }

    function generateId(len) {
        let arr = new Uint8Array((len || 40) / 2);
        window.crypto.getRandomValues(arr);
        return Array.from(arr, dec2hex).join("");
    }

    function isTainted(canvas) {
        try {
            let context = canvas.getContext("2d", { willReadFrequently: true });
            let pixel = context.getImageData(0, 0, 1, 1);
            return false;
        } catch (err) {
            return err.code === 18;
        }
    }

    function waitForLoad() {
        return new Promise((resolve) => {
            if (document.readyState === "complete") {
                resolve();
            } else {
                window.addEventListener("load", resolve);
            }
        });
    }

    window.addEventListener("message", (event) => {
        if (event.data && event.data.canvasInfoList) {
            let newCanvases = event.data.canvasInfoList.filter(
                (canvas) =>
                    !canvasList.some(
                        (existingCanvas) => existingCanvas.id === canvas.id,
                    ),
            );
            canvasList = canvasList.concat(newCanvases);
            chrome.runtime.sendMessage({ canvasInfoList: canvasList });
        }
    });

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach((node) => {
                    if (
                        node.tagName &&
                        node.tagName.toLowerCase() === "canvas"
                    ) {
                        console.log("New canvas detected:", node);
                        updateCanvasList();
                        chrome.runtime.sendMessage({
                            canvasInfoList: canvasList,
                        });
                    }
                });
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    console.log("Content script loaded and running.");
})();
