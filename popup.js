(async function () {
    const COMMANDS = {
        GET_CANVAS_INFO_LIST: "GET_CANVAS_INFO_LIST",
        GET_CANVAS_DATA: "GET_CANVAS_DATA",
    };

    let canvasInfoList = [];

    document.getElementById("download").addEventListener(
        "click",
        async (event) => {
            event.preventDefault();
            let main = document.getElementById("main");
            main.style.display = "none";
            let spinner = document.getElementById("spinner");
            spinner.style.display = "block";

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF("landscape");
            for (let info of canvasInfoList) {
                let canvasData = await getCanvasContent({
                    frame: info.frameId,
                    index: info.index,
                    type: "image/png",
                });
                if (info.index > 0) {
                    pdf.addPage();
                }
                pdf.addImage(canvasData.dataURL, "PNG", 10, 10, 280, 150);
            }
            pdf.save("slides.pdf");

            main.style.display = "block";
            spinner.style.display = "none";
        },
        false,
    );

    document.getElementById("refresh").addEventListener("click", async () => {
        updateSlideCount();
    });

    chrome.runtime.onMessage.addListener(function (message) {
        console.log("Popup script received message:", message);
        if (message.canvasInfoList) {
            canvasInfoList = message.canvasInfoList;
            document.getElementById("slide-count").innerText =
                `Slides detected: ${canvasInfoList.length}`;
        }
    });

    async function updateSlideCount() {
        let tabs = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });
        console.log(
            "Sending message to content script to get canvas info list",
        );
        await chrome.tabs.sendMessage(
            tabs[0].id,
            { command: COMMANDS.GET_CANVAS_INFO_LIST },
            (response) => {
                if (response && response.canvasInfoList) {
                    canvasInfoList = response.canvasInfoList;
                    document.getElementById("slide-count").innerText =
                        `Slides detected: ${canvasInfoList.length}`;
                } else {
                    console.error("Failed to get canvas info list");
                }
            },
        );
    }

    async function getCanvasContent(data) {
        let tabs = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });
        return new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                { command: COMMANDS.GET_CANVAS_DATA, data },
                (response) => {
                    if (response && response.dataURL) {
                        resolve(response);
                    } else {
                        reject(new Error("Failed to get canvas data"));
                    }
                },
            );
        });
    }

    // Initial load
    updateSlideCount();
})();
