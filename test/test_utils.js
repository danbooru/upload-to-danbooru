import should from "should/as-function.js";

import {
    DataURLsNotSupportedError,
    TabUtils,
    asQueryCode,
    makeBatchUrl,
    makePostUrl,
    makeUrl,
    getPageActionMatchRegExp,
    queryCodes,
} from "upload-to-danbooru/utils.js";

const prefix = "http://example.com/";
const pageUrl = "http://example.net/post/123";
const frameUrl = "http://example.org/";
const srcUrl = "http://cdn.example.net/xxx.jpg";
const tab = {id: 123, index: 9, url: pageUrl};
const nijieUrl = "https://nijie.info/view.php?id=88014";
const nijieMobileUrl = "https://sp.nijie.info/view.php?id=88014";
const nicoSeigaUrl = "https://seiga.nicovideo.jp/seiga/im2740553";
const twitterUrl = "https://twitter.com/doodlerush/status/915203652704440321";
const pixivUrl = "https://www.pixiv.net/en/artworks/46260979";

describe("asQueryCode()", function() {
    it("one", function() {
        const code = asQueryCode("css");

        should(code).equal("!!document.querySelector(\"css\")");
    });

    it("many", function() {
        const code = asQueryCode("css", 1);

        should(code).equal("document.querySelectorAll(\"css\").length > 1");
    });
});

describe("makeBatchUrl()", function() {
    it("", function() {
        const url = makeBatchUrl(prefix, pageUrl);

        should(url.href).equal("http://example.com/uploads/batch?url=http%3A%2F%2Fexample.net%2Fpost%2F123");
    });
});

describe("makePostUrl()", function() {
    it("no ref", function() {
        const url = makePostUrl(prefix, srcUrl);

        should(url.href).equal("http://example.com/uploads/new?url=http%3A%2F%2Fcdn.example.net%2Fxxx.jpg");
    });

    it("with ref", function() {
        const url = makePostUrl(prefix, srcUrl, pageUrl);

        should(url.href).equal("http://example.com/uploads/new?url=http%3A%2F%2Fcdn.example.net%2Fxxx.jpg&ref=http%3A%2F%2Fexample.net%2Fpost%2F123");
    });
});

describe("makeUrl()", function() {
    it("batch", async function() {
        const url = await makeUrl(prefix, true, {pageUrl});

        should(url.href).equal("http://example.com/uploads/batch?url=http%3A%2F%2Fexample.net%2Fpost%2F123");
    });

    it("data url", async function() {
        let url;

        try {
            url = await makeUrl(prefix, false, {srcUrl: "data:,test"});
        } catch(e) {
            should(e).equal(DataURLsNotSupportedError);

            return;
        }

        should(url).fail();
    });

    it("from page", async function() {
        const url = await makeUrl(prefix, false, {pageUrl, srcUrl});

        should(url.href).equal("http://example.com/uploads/new?url=http%3A%2F%2Fcdn.example.net%2Fxxx.jpg&ref=http%3A%2F%2Fexample.net%2Fpost%2F123");
    });

    it("from image clean", async function() {
        const url = await makeUrl(prefix, false, {pageUrl: srcUrl, srcUrl});

        should(url.href).equal("http://example.com/uploads/new?url=http%3A%2F%2Fcdn.example.net%2Fxxx.jpg");
    });

    it("from frame with image", async function() {
        const url = await makeUrl(prefix, false, {pageUrl: srcUrl, srcUrl, frameUrl});

        should(url.href).equal("http://example.com/uploads/new?url=http%3A%2F%2Fcdn.example.net%2Fxxx.jpg&ref=http%3A%2F%2Fexample.org%2F");
    });

    it("from image with referrer", async function() {
        const getReferrer = async () => pageUrl;
        const url = await makeUrl(prefix, false, {pageUrl: srcUrl, srcUrl}, getReferrer);

        should(url.href).equal("http://example.com/uploads/new?url=http%3A%2F%2Fcdn.example.net%2Fxxx.jpg&ref=http%3A%2F%2Fexample.net%2Fpost%2F123");
    });
});

describe("getPageActionMatchRegExp()", function() {
    it("", function() {
        const globs = [
            "https://twitter.com/*/status/*",
            "https://www.pixiv.net/artworks/*",
            "https://*.tumblr.com/post/*",
        ];
        const result = getPageActionMatchRegExp(globs);

        should(result).equal("^https://twitter\\.com/.*/status/.*|^https://www\\.pixiv\\.net/artworks/.*|^https://.*\\.tumblr\\.com/post/.*");
    });
});

describe("class TabUtils", function() {
    describe("makeUrl()", function() {
        it("batch", function() {
            const tabUtils = new TabUtils(tab, {});
            const url = tabUtils.makeUrl(prefix, true);

            should(url.href).equal("http://example.com/uploads/batch?url=http%3A%2F%2Fexample.net%2Fpost%2F123");
        });

        it("new", function() {
            const tabUtils = new TabUtils(tab, {});
            const url = tabUtils.makeUrl(prefix);

            should(url.href).equal("http://example.com/uploads/new?url=http%3A%2F%2Fexample.net%2Fpost%2F123");
        });
    });

    describe("openPage()", function() {
        it("current", function() {
            const update = (tabId, params) => ({id: tabId, url: params.url});
            const tabUtils = new TabUtils(tab, {update});
            const result = tabUtils.openPage(pageUrl, true);

            should(result).deepEqual({id: tab.id, url: pageUrl});
        });

        it("new", function() {
            const create = (params) => params;
            const tabUtils = new TabUtils(tab, {create});
            const result = tabUtils.openPage(pageUrl);

            should(result).deepEqual({
                active: true,
                openerTabId: tab.id,
                url: pageUrl,
            });
        });

        it("newNextToCurrent", function() {
            const create = (params) => params;
            const tabUtils = new TabUtils(tab, {create});
            const result = tabUtils.openPage(pageUrl, false, false, true);

            should(result).deepEqual({
                active: true,
                index: 10,
                openerTabId: tab.id,
                url: pageUrl,
            });
        });

        it("background", function() {
            const create = (params) => params;
            const tabUtils = new TabUtils(tab, {create});
            const expected = {active: false, openerTabId: tab.id, url: pageUrl};
            const result = tabUtils.openPage(pageUrl, false, true);

            should(result).deepEqual(expected);
        });

        it("backgroundNextToCurrent", function() {
            const create = (params) => params;
            const tabUtils = new TabUtils(tab, {create});
            const result = tabUtils.openPage(pageUrl, false, true, true);

            should(result).deepEqual({
                active: false,
                index: 10,
                openerTabId: tab.id,
                url: pageUrl,
            });
        });
    });

    describe("getReferrer()", function() {
        const expectedCalls = [{tabId: tab.id, params: {code: "document.referrer"}}];

        it("has referrer", async function() {
            const calls = [];
            async function executeScript(tabId, params) {
                calls.push({tabId, params});

                return [pageUrl];
            }

            const tabUtils = new TabUtils(tab, {executeScript});
            const result = await tabUtils.getReferrer();

            should(calls).deepEqual(expectedCalls);
            should(result).equal(pageUrl);
        });

        it("no referrer", async function() {
            const calls = [];
            async function executeScript(tabId, params) {
                calls.push({tabId, params});

                return [];
            }

            const tabUtils = new TabUtils(tab, {executeScript});
            const result = await tabUtils.getReferrer();

            should(calls).deepEqual(expectedCalls);
            should(result).equal("");
        });

        it("error", async function() {
            const calls = [];
            async function executeScript(tabId, params) {
                calls.push({tabId, params});

                throw new Error("error");
            }

            const tabUtils = new TabUtils(tab, {executeScript});
            const result = await tabUtils.getReferrer();

            should(calls).deepEqual(expectedCalls);
            should(result).equal("");
        });
    });

    describe("isGenericBatch()", function() {
        const testQueryCodes = [
            "!!document.querySelector(\"#see-more\")",
            "document.querySelectorAll(\"img\").length > 1",
        ];

        it("match", async function() {
            const calls = [];
            async function executeScript(tabId, params) {
                calls.push({tabId, params});

                return [true];
            }
            const tabUtils = new TabUtils(tab, {executeScript});
            const result = await tabUtils.isGenericBatch(testQueryCodes);

            should(calls).deepEqual([
                {tabId: tab.id, params: {code: "!!document.querySelector(\"#see-more\")"}},
            ]);
            should(result).equal(true);
        });

        it("none", async function() {
            const calls = [];
            async function executeScript(tabId, params) {
                calls.push({tabId, params});

                return [false];
            }
            const tabUtils = new TabUtils(tab, {executeScript});
            const result = await tabUtils.isGenericBatch(testQueryCodes);

            should(calls).deepEqual([
                {tabId: tab.id, params: {code: "!!document.querySelector(\"#see-more\")"}},
                {tabId: tab.id, params: {code: "document.querySelectorAll(\"img\").length > 1"}},
            ]);
            should(result).equal(false);
        });

        it("empty", async function() {
            const executeScript = () => [false];
            const tabUtils = new TabUtils(tab, {executeScript});
            const result = await tabUtils.isGenericBatch([]);

            should(result).equal(false);
        });
    });

    const isGenericBatchReust = new Object();

    class XGenericBatchTabUtils extends TabUtils {
        constructor(tab, api) {
            super(tab, api);
            this.isGenericBatchCalls = [];
        }

        isGenericBatch(...args) {
            this.isGenericBatchCalls.push(args);
            return isGenericBatchReust;
        }
    }

    describe("isNijieBatch()", function() {
        it("popup", function() {
            const tab = {id: 999, url: "https://nijie.info/view_popup.php?id=88014"};
            const tabUtils = new XGenericBatchTabUtils(tab, {});
            const result = tabUtils.isNijieBatch();

            should(tabUtils.isGenericBatchCalls).deepEqual([
                [queryCodes.nijie.viewPopup],
            ]);
            should(result).equal(isGenericBatchReust);
        });

        it("regular", function() {
            const tab = {id: 999, url: nijieUrl};
            const tabUtils = new XGenericBatchTabUtils(tab, {});
            const result = tabUtils.isNijieBatch();

            should(tabUtils.isGenericBatchCalls).deepEqual([
                [queryCodes.nijie.view],
            ]);
            should(result).equal(isGenericBatchReust);
        });

        it("mobile popup", function() {
            const tab = {id: 999, url: "https://sp.nijie.info/view_popup.php?id=88014"};
            const tabUtils = new XGenericBatchTabUtils(tab, {});
            const result = tabUtils.isNijieBatch();

            should(tabUtils.isGenericBatchCalls).deepEqual([
                [queryCodes.nijie.sp.viewPopup],
            ]);
            should(result).equal(isGenericBatchReust);
        });

        it("mobile regular", function() {
            const tab = {id: 999, url: nijieMobileUrl};
            const tabUtils = new XGenericBatchTabUtils(tab, {});
            const result = tabUtils.isNijieBatch();

            should(tabUtils.isGenericBatchCalls).deepEqual([
                [queryCodes.nijie.sp.view],
            ]);
            should(result).equal(isGenericBatchReust);
        });
    });

    describe("isPixivBatch()", function() {
        it("", function() {
            const tab = {id: 999, url: pixivUrl};
            const tabUtils = new XGenericBatchTabUtils(tab, {});
            const result = tabUtils.isPixivBatch();

            should(tabUtils.isGenericBatchCalls).deepEqual([
                [queryCodes.pixiv],
            ]);
            should(result).equal(isGenericBatchReust);
        });
    });

    describe("isNicoSeigaBatch()", function() {
        it("manga", function() {
            const tab = {id: 999, url: "https://seiga.nicovideo.jp/watch/mg188311"};
            const tabUtils = new TabUtils(tab, {});
            const result = tabUtils.isNicoSeigaBatch();

            should(result).equal(true);
        });

        it("illust", function() {
            const tab = {id: 999, url: nicoSeigaUrl};
            const tabUtils = new TabUtils(tab, {});
            const result = tabUtils.isNicoSeigaBatch();

            should(result).equal(false);
        });
    });

    describe("isTwitterBatch()", function() {
        it("multiple images", async function() {
            const tab = {id: 999, url: "https://twitter.com/HIDEO_KOJIMA_EN/status/1240545404346716160"};
            const executeScript = () => [true];
            const tabUtils = new TabUtils(tab, {executeScript});
            const result = await tabUtils.isTwitterBatch();

            should(result).equal(true);
        });

        it("full size view", async function() {
            const tab = {id: 999, url: "https://twitter.com/HIDEO_KOJIMA_EN/status/1240545404346716160/photo/1"};
            const tabUtils = new TabUtils(tab, {});
            const result = await tabUtils.isTwitterBatch();

            should(result).equal(false);
        });

        it("single image", async function() {
            const tab = {id: 999, url: twitterUrl};
            const executeScript = () => [false];
            const tabUtils = new TabUtils(tab, {executeScript});
            const result = await tabUtils.isTwitterBatch();

            should(result).equal(false);
        });
    });

    describe("isBatch()", function() {
        const isBatch = new Object();
        const urls = [nijieUrl, nicoSeigaUrl, twitterUrl, pixivUrl];
        const error =  new Error("error");

        class XTabUtils extends TabUtils {
            constructor(tab, api, match, result) {
                super(tab, api);
                this._match = match;
                this._result = result;
            }

            isXBatch(name) {
                if (this._match !== name) {
                    throw error;
                }
                return this._result;
            }

            isNijieBatch() {
                return this.isXBatch("nijie");
            }

            isNicoSeigaBatch() {
                return this.isXBatch("nicoseiga");
            }

            isTwitterBatch() {
                return this.isXBatch("twitter");
            }

            isPixivBatch() {
                return this.isXBatch("pixiv");
            }
        }

        for (const url of urls) {
            it(`XTabUtils.isXBatch() error ${url}`, async function() {
                const tab = {id: 999, url: url};
                const tabUtils = new XTabUtils(tab, {}, "test", isBatch);
                let result;

                try {
                    result = await tabUtils.isBatch();
                } catch(e) {
                    should(e).equal(error);
                    return;
                }

                should(result).fail();
            });
        }

        it("nijie", async function() {
            const tab = {id: 999, url: nijieUrl};
            const tabUtils = new XTabUtils(tab, {}, "nijie", isBatch);
            const result = await tabUtils.isBatch();

            should(result).equal(isBatch);
        });

        it("nicoseiga", async function() {
            const tab = {id: 999, url: nicoSeigaUrl};
            const tabUtils = new XTabUtils(tab, {}, "nicoseiga", isBatch);
            const result = await tabUtils.isBatch();

            should(result).equal(isBatch);
        });

        it("twitter", async function() {
            const tab = {id: 999, url: twitterUrl};
            const tabUtils = new XTabUtils(tab, {}, "twitter", isBatch);
            const result = await tabUtils.isBatch();

            should(result).equal(isBatch);
        });

        it("pixiv", async function() {
            const tab = {id: 999, url: pixivUrl};
            const tabUtils = new XTabUtils(tab, {}, "pixiv", isBatch);
            const result = await tabUtils.isBatch();

            should(result).equal(isBatch);
        });

        it("other", async function() {
            const tabUtils = new TabUtils(tab, {});
            const result = await tabUtils.isBatch();

            should(result).equal(false);
        });
    });
});
