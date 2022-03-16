import {
    DanbooruURL,
    fixUrl,
    makeUploadUrl,
    getReferer,
    getPageActionMatchRegExp,
} from "./utils.js";

export class UploadToDanbooru {
    constructor(
        browser,
        isChrome,
        settings,
        urlOpenerClass,
    ) {
        this.browser = browser;
        this.settings = settings;
        this.urlOpenerClass = urlOpenerClass;
        this.manifest = browser.runtime.getManifest();
        this.isChrome = isChrome;
        this.menuID = "upload-to-danbooru";
        this.defaultDanbooruURL = DanbooruURL;

        this.onInstalled = this.onInstalled.bind(this);
        this.onContextMenuClicked = this.onContextMenuClicked.bind(this);
        this.onPageActionClicked = this.onPageActionClicked.bind(this);
        this.addPageActionRules = this.addPageActionRules.bind(this);
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

    init() {
        this.browser.runtime.onInstalled.addListener(this.onInstalled);
        this.pageActionAPI.onClicked.addListener(this.onPageActionClicked);

        if (this.browser.contextMenus) {
            this.browser.contextMenus.onClicked.addListener(this.onContextMenuClicked);
        }

        if (!this.isChrome) {
            this.setUpContextMenus();
        }
    }

    setUpContextMenus() {
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

    onInstalled() {
        if (this.isChrome) {
            this.browser.declarativeContent.onPageChanged.removeRules(undefined, this.addPageActionRules);
            this.browser.action.disable();
            this.setUpContextMenus();
        }
    }

    addPageActionRules() {
        const rule = {
            conditions: [
                new this.browser.declarativeContent.PageStateMatcher({
                    pageUrl: {
                        urlMatches: this.pageActionRegexString,
                    },
                }),
            ],
            actions: [
                new this.browser.declarativeContent.ShowAction(),
            ],
        };

        this.browser.declarativeContent.onPageChanged.addRules([rule]);
    }

    async onContextMenuClicked(info, tab) {
        if (info.menuItemId !== this.menuID) {
            return;
        }

        const settings = await this.settings.get("url", "openIn");
        const danbooruUrl = settings.url || this.defaultDanbooruURL;
        const ref = getReferer(info, this.pageActionRegex);
        const src = fixUrl(info.srcUrl);
        const url = makeUploadUrl(danbooruUrl, src, ref);
        const urlOpener = this.getUrlOpener(tab);

        await urlOpener.open(url.href, settings.openIn);
    }

    async onPageActionClicked(tab) {
        const settings = await this.settings.get("url", "openIn");
        const danbooruUrl = settings.url || this.defaultDanbooruURL;
        const url = makeUploadUrl(danbooruUrl, tab.url);
        const urlOpener = this.getUrlOpener(tab);

        await urlOpener.open(url.href, settings.openIn);
    }
}
