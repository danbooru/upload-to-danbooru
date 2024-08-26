class RPC {
    constructor(api) {
        this.__browser = api;
        this.__onMessage = this.__onMessage.bind(this);
    }

    __init() {
        return this.__browser.runtime.onMessage.addListener(this.__onMessage);
    }

    __onMessage(request, sender, sendResponse) {
        const result = this[request.call]?.(request.args);

        if (!result) {
            return;
        }

        if (result.then instanceof Function) {
            result.then(sendResponse);
            return true;
        }

        sendResponse(result);
    }

    getPageURLs() {
        return [
            {
                type: "canonical",
                value: document.querySelector("link[rel='canonical']")?.href,
            }, {
                type: "og",
                value: document.querySelector("meta[property='og:url']")?.content
            }, {
                type: "twitter",
                value: document.querySelector("meta[property='twitter:url']")?.content
            },
        ].filter(u => u.value);
    }
}

const api = window.browser ?? window.chrome;

if (api) {
    const rpc = new RPC(api);

    rpc.__init();
}
