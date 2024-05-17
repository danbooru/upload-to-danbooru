import should from "should/as-function.js";

import { ContextMenuSetupper } from "upload-to-danbooru/contextMenuManager.js";
import { UploadToDanbooru } from "upload-to-danbooru/uploadToDanbooru.js";
import { InMemorySettings } from "upload-to-danbooru/settings.js";


describe("UploadToDanbooru", function() {
    class TestContextMenuSetupper extends ContextMenuSetupper {
        constructor() {
            super();
            this.setupCallCount = 0;
        }

        setup() {
            this.setupCallCount++;
        }
    }

    const chromeManifest = {
        "minimum_chrome_version": "97",
        "action": {
            "show_matches": [
                "https://x.com/*/status/*",
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
        let onInstalled, onContextMenuClicked, onPageActionClicked;
        const settings = new InMemorySettings();
        const cms = new TestContextMenuSetupper();
        const browser = {
            isChrome: false,
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
                    async addListener(callback) {
                        onInstalled = callback;
                    }
                },
                getManifest() {
                    return {};
                }
            },
        };
        const uploadToDanbooru = new UploadToDanbooru(browser, false, settings, cms);

        await uploadToDanbooru.init();

        should(onInstalled).equal(uploadToDanbooru.onInstalled);
        should(onContextMenuClicked).equal(uploadToDanbooru.onContextMenuClicked);
        should(onPageActionClicked).equal(uploadToDanbooru.onPageActionClicked);
        should(cms.setupCallCount).equal(1);
    });

    it("onInstalled() browser", async function() {
        const cms = new TestContextMenuSetupper();
        const settings = new InMemorySettings();
        const browser = {
            runtime: {
                getManifest() {
                    return {};
                }
            }
        };
        const uploadToDanbooru = new UploadToDanbooru(browser, false, settings, cms);

        await uploadToDanbooru.onInstalled();

        should(cms.setupCallCount).equal(0);
    });

    it("onInstalled() chrome", async function() {
        const cms = new TestContextMenuSetupper();
        const settings = new InMemorySettings();
        const chrome = {
            runtime: {
                getManifest() {
                    return chromeManifest;
                }
            }
        };
        const uploadToDanbooru = new UploadToDanbooru(chrome, true, settings, cms);

        await uploadToDanbooru.onInstalled();

        should(cms.setupCallCount).equal(1);
    });
});
