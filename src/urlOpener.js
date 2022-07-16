export class NotImplementedError extends Error {}

export class URLOpener {
    // eslint-disable-next-line no-unused-vars
    async current(url) {
        throw new NotImplementedError();
    }

    // eslint-disable-next-line no-unused-vars
    async new(url, background) {
        throw new NotImplementedError();
    }

    open(url, openIn) {
        switch (openIn) {
        case "new": return this.new(url, false);
        case "background": return this.new(url, true);
        default: return this.current(url);
        }
    }
}

export class GenericURLOpener extends URLOpener {
    constructor(browser, tab) {
        super();

        this.browser = browser;
        this.tab = tab;
    }

    current(url) {
        return this.browser.tabs.update(this.tab.id, {url});
    }

    get newTabParams() {
        throw new NotImplementedError();
    }

    new(url, background) {
        return this.browser.tabs.create({
            active: !background,
            url: url,
            ...this.newTabParams,
        });
    }
}

export class BrowserURLOpener extends GenericURLOpener {
    get newTabParams() {
        return {openerTabId: this.tab.id};
    }
}

export class AndroidURLOpener extends GenericURLOpener {
    get newTabParams() {
        return {};
    }
}

export class ChromeURLOpener extends GenericURLOpener {
    get newTabParams() {
        return {index: this.tab.index + 1, openerTabId: this.tab.id};
    }
}

export class NoopURLOpener extends URLOpener {
    // eslint-disable-next-line no-unused-vars
    async current(url) {}
    // eslint-disable-next-line no-unused-vars
    async new(url, background) {}
}
