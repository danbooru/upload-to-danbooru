// eslint-disable-next-line no-unused-vars
async function install(document, browser, name) {
    // TODO: Lazy load on first detectBatch message
    const src = browser.runtime.getURL("batchDetectors.js");
    const batchDetectors = await import(src);

    globalThis.batchDetector = new batchDetectors[name](document);
}

class MessageHandler {
    static getReferrer(request, sender, sendResponse) {
        sendResponse({referrer: document.referrer});
    }

    static detectBatch(request, sender, sendResponse) {
        const batchDetector = globalThis.batchDetector;

        if (batchDetector && batchDetector.isDetectable) {
            sendResponse({isBatch: batchDetector.isBatch});
        }
    }
}

function onMessage(request, sender, sendResponse) {
    return MessageHandler[request.type](request, sender, sendResponse);
}

const api = globalThis.browser || globalThis.chrome;

api.runtime.onMessage.addListener(onMessage);
