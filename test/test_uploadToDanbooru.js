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


    it("init()", async function() {
        let onInstalled, onContextMenuClicked, onPageActionClicked, contextMenuEntry;
        const browser = {
            isChrome: false,
            contextMenus: {
                create(spec) {
                    contextMenuEntry = spec;
                },
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

        await uploadToDanbooru.init();

        should(onInstalled).equal(uploadToDanbooru.onInstalled);
        should(onContextMenuClicked).equal(uploadToDanbooru.onContextMenuClicked);
        should(onPageActionClicked).equal(uploadToDanbooru.onPageActionClicked);
        should(contextMenuEntry).deepEqual({
            id: "upload-to-danbooru",
            title: "Upload to &Danbooru",
            contexts: ["image"],
            targetUrlPatterns: ["https://*/*", "http://*/*"],
        });

    });

    it("onInstalled() browser", function() {
        const browser = {
            isChrome: false,
            runtime: {
                getManifest() {
                    return {};
                }
            }
        };
        const uploadToDanbooru = new UploadToDanbooru(browser);

        uploadToDanbooru.onInstalled();
    });

    it("onInstalled() chrome", function() {
        let contextMenuEntry;
        const chrome = {
            contextMenus: {
                create(spec) {
                    contextMenuEntry = spec;
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
    });
});
