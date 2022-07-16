import { asBool } from "./utils.js";

export class NotImplementedError extends Error {}

export class ContextMenuManager {
    // eslint-disable-next-line no-unused-vars
    add() {
        throw new NotImplementedError();
    }

    // eslint-disable-next-line no-unused-vars
    remove() {
        throw new NotImplementedError();
    }
}

export class BrowserContextMenuManager extends ContextMenuManager {
    constructor(browser, menuID) {
        super();
        this.browser = browser;
        this.menuID = menuID || "upload-to-danbooru";
    }

    add() {
        if (!this.browser.contextMenus) {
            return;
        }

        this.browser.contextMenus.create({
            id: this.menuID,
            title: "Upload to &Danbooru",
            contexts: ["image"],
            targetUrlPatterns: ["https://*/*", "http://*/*"],
        });
    }

    remove() {
        if (!this.browser.contextMenus) {
            return;
        }

        return this.browser.contextMenus.removeAll();
    }
}

export class ContextMenuSetupper {
    // eslint-disable-next-line no-unused-vars
    async setup() {
        throw new NotImplementedError();
    }
}

export class ContextMenuSetupperImpl extends ContextMenuSetupper {
    constructor(contextMenuManager, settings, settingsKey) {
        super();
        this.contextMenuManager = contextMenuManager;
        this.settings = settings;
        this._settingsKey = settingsKey || "contextMenuEnabled";
    }

    async setup() {
        this.contextMenuManager.remove();

        const settings = await this.settings.get(this._settingsKey);
        const contextMenuEnabled = asBool(settings[this._settingsKey], true);

        if (contextMenuEnabled) {
            this.contextMenuManager.add();
        }
    }
}
