export class NotImplementedError extends Error {}

export class ContentScriptInjector {
    // eslint-disable-next-line no-unused-vars
    async inject(tabId, contentScript) {
        throw new NotImplementedError();
    }
}

export class BrowserContentScriptInjector extends ContentScriptInjector {
    constructor(browser) {
        super();

        this.browser = browser;
    }

    inject(tabId, contentScript) {
        const details = {file: contentScript};

        return this.browser.tabs.executeScript(tabId, details);
    }
}

export class ChromeContentScriptInjector extends ContentScriptInjector {
    constructor(chrome) {
        super();

        this.chrome = chrome;
    }

    inject(tabId, contentScript) {
        const injection = {target: {tabId}, files: [contentScript]};

        return this.chrome.scripting.executeScript(injection);
    }
}

export class BatchDetectorInjector {
    constructor(
        src,
        contentScriptInjector,
        tabMessagingProtocol,
        sleeper,
        pingDelay,
        pingCount,
    ) {
        this.src = src;
        this.contentScriptInjector = contentScriptInjector;
        this.tabMessagingProtocol = tabMessagingProtocol;
        this.sleeper = sleeper;
        this.pingDelay = pingDelay || 100;
        this.pingCount = pingCount || 10;
    }

    async inject(tabId) {
        if (await this.tabMessagingProtocol.ping(tabId)) {
            return;
        }

        await this.contentScriptInjector.inject(tabId, this.src);

        for (let i = 0; i < this.pingCount; i++) {
            if (await this.tabMessagingProtocol.ping(tabId)) {
                return;
            }

            await this.sleeper.sleep(this.pingDelay);
        }

        throw new Error("failed to inject batch detector");
    }
}
