function importOnce(src) {
    let p;

    return () => {
        if (!p) {
            p = import(src);
        }

        return p;
    };
}

class MessageHandler {
    static ping(request, sender, sendResponse) {
        sendResponse({pong: true});
    }

    static getReferrer(request, sender, sendResponse) {
        sendResponse({referrer: document.referrer});
    }

    static detectBatch(request, sender, sendResponse) {
        this._detectBatch(request, sender).then(sendResponse);

        return true;
    }

    static async _detectBatch() {
        const batchDetectors = await importBatchDetectors();
        const hostname = document.location.hostname;
        const cls = batchDetectors.match(hostname);

        if (!cls) {
            return {isBatch: false};
        }

        const batchDetector = new cls(document);

        return {isBatch: batchDetector.isDetectable && batchDetector.isBatch};
    }
}

function onMessage(request, sender, sendResponse) {
    return MessageHandler[request.type](request, sender, sendResponse);
}

const api = globalThis.browser || globalThis.chrome;
const src = api.runtime.getURL("batchDetectors.js");
const importBatchDetectors = importOnce(src);

api.runtime.onMessage.addListener(onMessage);
