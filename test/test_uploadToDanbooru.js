import should from "should/as-function.js";

import { UploadToDanbooru } from "upload-to-danbooru/uploadToDanbooru.js";

describe("UploadToDanbooru", function() {
    const chromeManifest = {
        "minimum_chrome_version": "97",
        "action": {
            "show_matches": [
                "https://twitter.com/*/status/*",
                "https://www.pixiv.net/artworks/*",
                "https://*.tumblr.com/post/*",
            ],
        },
    };

    it("pageActionAPI browser", function() {
        const pageAction = new Object();
        const browser = {
            pageAction,
            runtime: {
                getManifest() {
                    return {};
                }
            }
        };
        const uploadToDanbooru = new UploadToDanbooru(browser);

        should(uploadToDanbooru.pageActionAPI).equal(pageAction);
    });

    it("pageActionAPI chrome", function() {
        const action = new Object();
        const chrome = {
            action,
            runtime: {
                getManifest() {
                    return chromeManifest;
                }
            }
        };
        const uploadToDanbooru = new UploadToDanbooru(chrome, true);

        should(uploadToDanbooru.pageActionAPI).equal(action);
    });


    it("init()", function() {
        let onInstalled, onContextMenuClicked, onPageActionClicked;
        const browser = {
            contextMenus: {
                onClicked: {
                    addListener(callback) {
                        onContextMenuClicked = callback;
                    }
                },
            },
            pageAction: {
                onClicked: {
                    addListener(callback) {
                        onPageActionClicked = callback;
                    }
                }
            },
            runtime: {
                onInstalled: {
                    addListener(callback) {
                        onInstalled = callback;
                    }
                },
                getManifest() {
                    return {};
                }
            },
        };
        const uploadToDanbooru = new UploadToDanbooru(browser);

        uploadToDanbooru.init();

        should(onInstalled).equal(uploadToDanbooru.onInstalled);
        should(onContextMenuClicked).equal(uploadToDanbooru.onContextMenuClicked);
        should(onPageActionClicked).equal(uploadToDanbooru.onPageActionClicked);
    });

    it("onInstalled() browser", function() {
        let contextMenuEntry;
        const browser = {
            contextMenus: {
                create(spec) {
                    contextMenuEntry = spec;
                }
            },
            runtime: {
                getManifest() {
                    return {};
                }
            }
        };
        const uploadToDanbooru = new UploadToDanbooru(browser);

        uploadToDanbooru.onInstalled();

        should(contextMenuEntry).deepEqual({
            id: "upload-to-danbooru",
            title: "Upload to &Danbooru",
            contexts: ["image"],
            targetUrlPatterns: ["https://*/*", "http://*/*"],
        });
    });

    it("onInstalled() chrome", function() {
        let ids, onPageChanged, contextMenuEntry;
        let disabled = false;
        const chrome = {
            action: {
                disable() {
                    disabled = true;
                }
            },
            contextMenus: {
                create(spec) {
                    contextMenuEntry = spec;
                }
            },
            declarativeContent: {
                onPageChanged: {
                    removeRules(ids, callback) {
                        onPageChanged = callback;
                    }
                }
            },
            runtime: {
                getManifest() {
                    return chromeManifest;
                }
            }
        };
        const uploadToDanbooru = new UploadToDanbooru(chrome, true);

        uploadToDanbooru.onInstalled();

        should(contextMenuEntry).deepEqual({
            id: "upload-to-danbooru",
            title: "Upload to &Danbooru",
            contexts: ["image"],
            targetUrlPatterns: ["https://*/*", "http://*/*"],
        });
        should(ids).equal(undefined);
        should(onPageChanged).equal(uploadToDanbooru.addPageActionRules);
        should(disabled).equal(true);
    });

    it("addPageActionRules()", function() {
        let rules = [];
        class PageStateMatcher {
            constructor(rule) {
                this.rule = rule;
            }
        }
        class ShowAction {}
        const chrome = {
            runtime: {
                getManifest() {
                    return chromeManifest;
                },
            },
            declarativeContent: {
                PageStateMatcher,
                ShowAction,
                onPageChanged: {
                    addRules(newRules) {
                        rules.push(...newRules);
                    },
                },
            },
        };

        const uploadToDanbooru = new UploadToDanbooru(chrome, true);

        uploadToDanbooru.addPageActionRules();

        should(rules).deepEqual([
            {
                conditions: [
                    new PageStateMatcher({
                        pageUrl: {
                            urlMatches: "^https://twitter\\.com/.*/status/.*|^https://www\\.pixiv\\.net/artworks/.*|^https://.*\\.tumblr\\.com/post/.*",
                        },
                    }),
                ],
                actions: [
                    new ShowAction(),
                ],
            },
        ]);
    });
});
