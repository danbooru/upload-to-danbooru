import should from "should/as-function.js";

import {
    BrowserContextMenuManager,
    ContextMenuManager,
    ContextMenuSetupperImpl,
} from "upload-to-danbooru/contextMenuManager.js";
import { InMemorySettings } from "upload-to-danbooru/settings.js";

describe("BrowserContextMenuManager", function() {
    it("add()", function() {
        const menus = [];
        const browser = {
            contextMenus: {
                create(params) {
                    menus.push(params);
                }
            },
        };
        const cm = new BrowserContextMenuManager(browser);

        cm.add();

        should(menus.length).equal(1);
        should(menus[0]).deepEqual({
            id: "upload-to-danbooru",
            title: "Upload to &Danbooru",
            contexts: ["image"],
            targetUrlPatterns: ["https://*/*", "http://*/*"],
        });
    });

    it("add() not implemented", function() {
        const cm = new BrowserContextMenuManager({});

        cm.add();
    });

    it("remove()", function() {
        let removedCount = 0;
        const browser = {
            contextMenus: {
                removeAll() {
                    removedCount++;
                }
            },
        };
        const cm = new BrowserContextMenuManager(browser);

        cm.remove();

        should(removedCount).equal(1);
    });

    it("remove() not implemented", function() {
        const cm = new BrowserContextMenuManager({});

        cm.remove();
    });
});

describe("ContextMenuSetupperImpl", function() {
    class TestContextMenuManager extends ContextMenuManager {
        constructor() {
            super();
            this.addCallCount = 0;
            this.removeCallCount = 0;
        }

        add() {
            this.addCallCount++;
        }

        remove() {
            this.removeCallCount++;
        }

        get menuID() {
            return "testMenuId";
        }
    }

    it("setup() default enabled", async function() {
        const cm = new TestContextMenuManager();
        const settings = new InMemorySettings();
        const cms = new ContextMenuSetupperImpl(cm, settings);

        await cms.setup();

        should(cm.removeCallCount).equal(1);
        should(cm.addCallCount).equal(1);
    });

    it("setup() enabled", async function() {
        const cm = new TestContextMenuManager();
        const settings = new InMemorySettings();
        const cms = new ContextMenuSetupperImpl(cm, settings, "testKey");

        await settings.set({"testKey": "on"});

        await cms.setup();

        should(cm.removeCallCount).equal(1);
        should(cm.addCallCount).equal(1);
    });

    it("setup() disabled", async function() {
        const cm = new TestContextMenuManager();
        const settings = new InMemorySettings();
        const cms = new ContextMenuSetupperImpl(cm, settings, "testKey");

        await settings.set({"testKey": "off"});

        await cms.setup();

        should(cm.removeCallCount).equal(1);
        should(cm.addCallCount).equal(0);
    });
});

