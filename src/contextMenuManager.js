import { asBool } from "./utils.js";

export class NotImplementedError extends Error {}

export class ContextMenuManager {
    add() {
        throw new NotImplementedError();
    }

    remove() {
        throw new NotImplementedError();
    }
}

export class BrowserContextMenuManager extends ContextMenuManager {
    constructor(browser, menuID) {
        super();
        this.browser = browser;
        this.menuID = menuID || "upload-to-danbooru";
        this.enabled = true;
        this.onShown = this.onShown.bind(this);
        this.onHidden = this.onHidden.bind(this);
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
        this.browser.contextMenus.onShown.addListener(this.onShown);
        this.browser.contextMenus.onHidden.addListener(this.onHidden);
    }

    onHidden() {
        console.log("onHidden");
        return this.browser.contextMenus.update(this.menuID, {enabled: true});
    }

    async onShown(info, tab) {
        console.log("onShown", info, tab);
        console.log("srcUrl", info.srcUrl);
        console.log("pageUrl", info.pageUrl);
        if (!info.menuIDs.contains(this.menuID)) {
            return;
        }
        console.log("!info.menuIDs.contains(this.menuID)", !info.menuIDs.contains(this.menuID));

        const isDanbooru = info.srcUrl.startsWith("https://danbooru.donmai.us/");

        console.log("isDanbooru", isDanbooru);

        if (!isDanbooru) {
            return;
        }

        await this.browser.contextMenus.update(this.menuID, {enabled: false});
        await this.browser.contextMenus.refresh();
    }

    remove() {
        if (!this.browser.contextMenus) {
            return;
        }

        return this.browser.contextMenus.removeAll();
    }
}

export class ContextMenuSetupper {
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
