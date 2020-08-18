import should from "should/as-function.js";

import { setupPageAction } from "upload-to-danbooru/chrome.js";

describe("setupPageAction()", function() {
    const manifest = {
        "page_action": {
            "show_matches": [
                "https://twitter.com/*/status/*",
                "https://www.pixiv.net/artworks/*",
                "https://*.tumblr.com/post/*",
            ],
        },
    };

    it("match", async function() {
        const onUpdated = [];
        const showCalls = [];
        const browser = {
            runtime: {
                getManifest() {
                    return manifest;
                }
            },
            permissions: {
                contains(permissions) {
                    return permissions.permissions.find((p) => p === "tabs");
                }
            },
            pageAction: {
                async show(tabId) {
                    showCalls.push({tabId});
                }
            },
            tabs: {
                onUpdated: {
                    addListener(fn) {
                        onUpdated.push(fn);
                    }
                },
            }
        };

        await setupPageAction(browser);

        should(onUpdated).length(1);

        await onUpdated[0](999, {}, {id: 999, url: "https://www.pixiv.net/artworks/78653286"});

        should(showCalls).deepEqual([{tabId: 999}]);
    });

    it("no permissions", async function() {
        const browser = {
            permissions: {
                contains() {
                    return false;
                }
            },
        };

        await setupPageAction(browser);
    });
});
