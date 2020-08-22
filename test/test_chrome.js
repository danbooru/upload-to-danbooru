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

    class Noop {
        constructor(...args) {
            this.args = args;
        }
    }

    it("", function() {
        const onInstalled = [];
        const onPageChanged = [new Object(), new Object(), new Object()];
        const chrome = {
            runtime: {
                onInstalled: {
                    addListener(fn) {
                        onInstalled.push(fn);
                    }
                },
                getManifest() {
                    return manifest;
                },
            },
            declarativeContent: {
                PageStateMatcher: Noop,
                ShowPageAction: Noop,
                onPageChanged: {
                    addRules(rules) {
                        onPageChanged.push(...rules);
                    },
                    removeRules(ids, cb) {
                        onPageChanged.length = 0;
                        cb();
                    },
                },
            },
        };

        setupPageAction(chrome);

        should(onInstalled).length(1);

        onInstalled[0]();

        should(onPageChanged).length(1);
        should(onPageChanged[0].actions).length(1);
        should(onPageChanged[0].actions[0]).instanceOf(Noop);
        should(onPageChanged[0].actions[0].args).length(0);
        should(onPageChanged[0].conditions).length(1);
        should(onPageChanged[0].conditions[0]).instanceOf(Noop);
        should(onPageChanged[0].conditions[0].args).deepEqual([
            {
                pageUrl: {
                    urlMatches: "^https://twitter\\.com/.*/status/.*|^https://www\\.pixiv\\.net/artworks/.*|^https://.*\\.tumblr\\.com/post/.*",
                },
            },
        ]);
    });
});
