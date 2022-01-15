export class NotImplementedError extends Error {}

export class TabMessenger {
    // eslint-disable-next-line no-unused-vars
    async send(tabId, type, payload) {
        throw new NotImplementedError();
    }
}

export class BrowserTabMessenger extends TabMessenger {
    constructor(browser) {
        super();
        this.browser = browser;
    }

    send(tabId, type, payload) {
        return this.browser.tabs.sendMessage(tabId, {type, payload});
    }
}

export class ChromeTabMessenger extends TabMessenger {
    constructor(chrome) {
        super();
        this.chrome = chrome;
    }

    send(tabId, type, payload) {
        return new Promise((resolve, reject) => {
            this.chrome.tabs.sendMessage(
                tabId,
                {type, payload},
                (response) => {
                    if (response === undefined) {
                        const e = this.chrome.runtime.lastError;

                        if (e) {
                            reject(e);

                            return;
                        }
                    }

                    resolve(response);
                },
            );
        });
    }
}

export class TabMessagingProtocol {
    constructor(tabMessenger) {
        this.tabMessenger = tabMessenger;
    }

    async getReferrer(tabId) {
        const response = await this.tabMessenger.send(tabId, "getReferrer");

        return response ? response.referrer : "";
    }

    async isBatch(tabId) {
        const response = await this.tabMessenger.send(tabId, "detectBatch");

        return !!(response && response.isBatch);
    }
}

export function getTabMessenger(api, isChrome) {
    if (isChrome) {
        return new ChromeTabMessenger(api);
    }

    return new BrowserTabMessenger(api);
}
