import {getPageActionMatchRegExp} from "./utils.js";

export function setupPageAction(chrome) {
    const manifest = chrome.runtime.getManifest();
    const showMatches = manifest["page_action"]["show_matches"];
    const rule = {
        conditions: [
            new chrome.declarativeContent.PageStateMatcher({
                pageUrl: {
                    urlMatches: getPageActionMatchRegExp(showMatches),
                },
            }),
        ],
        actions: [
            new chrome.declarativeContent.ShowPageAction(),
        ],
    };

    chrome.runtime.onInstalled.addListener(function() {
        chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
            chrome.declarativeContent.onPageChanged.addRules([rule]);
        });
    });
}
