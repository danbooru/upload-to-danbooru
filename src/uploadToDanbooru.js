import {
    DanbooruURL,
    fixUrl,
    makeUploadUrl,
    getReferer,
    getPageActionMatchRegExp,
} from "./utils.js";

import { NoopURLOpener } from "./urlOpener.js";

export class UploadToDanbooru {
    constructor(
        browser,
        isChrome,
        settings,
        contextMenuSetupper,
        urlOpenerClass,
    ) {
        this.browser = browser;
        this.settings = settings;
        this.contextMenuSetupper = contextMenuSetupper;
        this.urlOpenerClass = urlOpenerClass || NoopURLOpener;
        this.manifest = browser.runtime.getManifest();
        this.isChrome = isChrome;
        this.menuID = "upload-to-danbooru";
        this.defaultDanbooruURL = DanbooruURL;

        this.onInstalled = this.onInstalled.bind(this);
        this.onContextMenuClicked = this.onContextMenuClicked.bind(this);
        this.onPageActionClicked = this.onPageActionClicked.bind(this);
    }

    get pageActionAPI() {
        if (this.isChrome) {
            return this.browser.action;
        }

        return this.browser.pageAction;
    }

    get pageActionRegexString() {
        const key = this.isChrome ? "action" : "page_action";

        return getPageActionMatchRegExp(this.manifest[key]["show_matches"]);
    }

    get pageActionRegex() {
        return new RegExp(this.pageActionRegexString);
    }

    getUrlOpener(tab) {
        return new this.urlOpenerClass(this.browser, tab);
    }

    async init() {
        this.browser.runtime.onInstalled.addListener(this.onInstalled);
        this.pageActionAPI.onClicked.addListener(this.onPageActionClicked);

        if (this.browser.contextMenus) {
            this.browser.contextMenus.onClicked.addListener(this.onContextMenuClicked);
        }

        if (!this.isChrome) {
            await this.contextMenuSetupper.setup();
        }
    }

    async onInstalled() {
        if (this.isChrome) {
            await this.contextMenuSetupper.setup();
        }
    }

    async onContextMenuClicked(info, tab) {
        if (info.menuItemId !== this.menuID) {
            return;
        }

        const settings = await this.settings.get("url", "openIn", "contextMenuOpenIn");
        const danbooruUrl = settings.url || this.defaultDanbooruURL;
        const ref = getReferer(info, this.pageActionRegex);
        const src = fixUrl(info.srcUrl);
        const url = makeUploadUrl(danbooruUrl, src, ref);
        const urlOpener = this.getUrlOpener(tab);
        // TODO: remove settings.openIn after next major version update (>=4)
        const openIn = settings.contextMenuOpenIn || settings.openIn || "background";

        await urlOpener.open(url.href, openIn);
    }

    async onPageActionClicked(tab) {
        const settings = await this.settings.get("url", "openIn", "pageActionOpenIn");
        const danbooruUrl = settings.url || this.defaultDanbooruURL;
        const url = makeUploadUrl(danbooruUrl, tab.url);
        const urlOpener = this.getUrlOpener(tab);
        // TODO: remove settings.openIn after next major version update (>=4)
        const openIn = settings.pageActionOpenIn || settings.openIn || "current";

        await urlOpener.open(url.href, openIn);
    }
}
