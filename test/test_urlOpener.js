import should from "should/as-function.js";

import {
    NotImplementedError,
    URLOpener,
    GenericURLOpener,
    BrowserURLOpener,
    AndroidURLOpener,
    ChromeURLOpener,
} from "upload-to-danbooru/urlOpener.js";

describe("URLOpener", function() {
    const url = "https://example.com";
    const urlOpener = new URLOpener();

    it("current()", function() {
        should(urlOpener.current(url)).rejectedWith(NotImplementedError);
    });

    it("new()", function() {
        should(urlOpener.new(url, true)).rejectedWith(NotImplementedError);
    });

    class TestURLOpener extends URLOpener {
        async current(url) {
            return {url};
        }

        async new(url, background) {
            return {url, background};
        }
    }

    const testUrlOpener = new TestURLOpener();

    it("open() new", async function() {
        const result = await testUrlOpener.open(url, "new");

        should(result).deepEqual({url, background: false});
    });

    it("open() background", async function() {
        const result = await testUrlOpener.open(url, "background");

        should(result).deepEqual({url, background: true});
    });

    it("open() current", async function() {
        const result = await testUrlOpener.open(url, "current");

        should(result).deepEqual({url});
    });

    it("open() default", async function() {
        const result = await testUrlOpener.open(url);

        should(result).deepEqual({url});
    });
});

describe("GenericURLOpener", function() {
    const url = "https://example.com";
    const tab = {id: 123};

    class TestURLOpener extends GenericURLOpener {
        get newTabParams() {
            return {test: `x${this.tab.id}`};
        }
    }

    it("current()", async function() {
        const update = [];
        const browser = {
            tabs: {
                async update(tabId, params) {
                    update.push([tabId, params]);
                }
            },
        };
        const urlOpener = new TestURLOpener(browser, tab);

        await urlOpener.current(url);

        should(update).deepEqual([[tab.id, {url}]]);
    });

    it("new() active", async function() {
        const create = [];
        const browser = {
            tabs: {
                async create(params) {
                    create.push(params);
                }
            },
        };
        const urlOpener = new TestURLOpener(browser, tab);

        await urlOpener.new(url, false);

        should(create).deepEqual([{url, active: true, test: "x123"}]);
    });

    it("new() background", async function() {
        const create = [];
        const browser = {
            tabs: {
                async create(params) {
                    create.push(params);
                }
            },
        };
        const urlOpener = new TestURLOpener(browser, tab);

        await urlOpener.new(url, false);

        should(create).deepEqual([{url, active: true, test: "x123"}]);
    });
});

describe("BrowserURLOpener", function() {
    const urlOpener = new BrowserURLOpener(undefined, {id: 123});

    it("subclass of GenericURLOpener", function() {
        should(urlOpener).instanceof(GenericURLOpener);
    });

    it("get newTabParams()", function() {
        should(urlOpener.newTabParams).deepEqual({openerTabId: 123});
    });
});

describe("AndroidURLOpener", function() {
    const urlOpener = new AndroidURLOpener();

    it("subclass of GenericURLOpener", function() {
        should(urlOpener).instanceof(GenericURLOpener);
    });

    it("get newTabParams()", function() {
        should(urlOpener.newTabParams).deepEqual({});
    });
});

describe("ChromeURLOpener", function() {
    const urlOpener = new ChromeURLOpener(undefined, {id: 123, index: 5});

    it("subclass of GenericURLOpener", function() {
        should(urlOpener).instanceof(GenericURLOpener);
    });

    it("get newTabParams()", function() {
        should(urlOpener.newTabParams).deepEqual({openerTabId: 123, index: 6});
    });
});
