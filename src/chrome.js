import {getPageActionMatchRegExp} from "./utils.js";

export async function setupPageAction(browser) {
    const hasTabsPermission = await browser.permissions.contains({permissions: ["tabs"]});

    if (!hasTabsPermission) {
        console.warn("page action is unavailable, missing tabs permission");
        return;
    }

    const manifest = browser.runtime.getManifest();
    const showMatches = manifest["page_action"]["show_matches"];
    const MatchPageActionUrl = getPageActionMatchRegExp(showMatches);

    browser.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab) {
        if (MatchPageActionUrl.test(tab.url)) {
            await browser.pageAction.show(tabId);
        }
    });
}
