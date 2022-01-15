import {TabUtils, makeUrl, getPageActionMatchRegExp} from "./utils.js";

export class UploadToDanbooru {
    constructor(browser, isChrome, settings, tabMessagingProtocol) {
        this.browser = browser;
        this.settings = settings;
        this.tabMessagingProtocol = tabMessagingProtocol;
        this.manifest = browser.runtime.getManifest();
        this.isChrome = isChrome;
        this.menuID = "upload-to-danbooru";
        this.defaultDanbooruURL = "https://danbooru.donmai.us/";

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

    init() {
        this.browser.runtime.onInstalled.addListener(this.onInstalled);
        this.browser.contextMenus.onClicked.addListener(this.onContextMenuClicked);
        this.pageActionAPI.onClicked.addListener(this.onPageActionClicked);
    }

    onInstalled() {
        this.browser.contextMenus.create({
            id: this.menuID,
            title: "Upload to &Danbooru",
            contexts: ["image"],
            targetUrlPatterns: ["https://*/*", "http://*/*"],
        });

        if (this.isChrome) {
            this.browser.declarativeContent.onPageChanged.removeRules(undefined, this.addPageActionRules);
            this.browser.action.disable();
        }
    }

    addPageActionRules() {
        const showMatches = this.manifest["action"]["show_matches"];
        const rule = {
            conditions: [
                new this.browser.declarativeContent.PageStateMatcher({
                    pageUrl: {
                        urlMatches: getPageActionMatchRegExp(showMatches),
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
        const batch = (info.modifiers || []).some((key) => key === "Ctrl");
        const tabUtils = new TabUtils(tab, this.browser.tabs);
        const getReferrer = () => this.tabMessagingProtocol.getReferrer(tab.id);
        const url = await makeUrl(danbooruUrl, batch, info, getReferrer);
        const current = settings.openIn === "current";
        const background = settings.openIn === "background";
        const nextToCurrent = this.isChrome;

        await tabUtils.openPage(url.href, current, background, nextToCurrent);
    }

    async onPageActionClicked(tab) {
        const settings = await this.settings.get("url", "openIn");
        const danbooruUrl = settings.url || this.defaultDanbooruURL;
        const tabUtils = new TabUtils(tab, this.browser.tabs);
        const batch = await this.tabMessagingProtocol.isBatch(tab.id);
        const url = tabUtils.makeUrl(danbooruUrl, batch);
        const current = settings.openIn === "current";
        const background = settings.openIn === "background";
        const nextToCurrent = this.isChrome;

        await tabUtils.openPage(url.href, current, background, nextToCurrent);
    }
}
