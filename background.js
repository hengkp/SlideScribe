chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension Installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === 'GET_CANVAS_DATA') {
        chrome.tabs.sendMessage(sender.tab.id, message, sendResponse);
        return true; // Indicate that we will send a response asynchronously
    }
});