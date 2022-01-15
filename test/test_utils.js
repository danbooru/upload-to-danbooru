import should from "should/as-function.js";

import {
    DataURLsNotSupportedError,
    TabUtils,
    fixUrl,
    makeBatchUrl,
    makePostUrl,
    makeUrl,
    getPageActionMatchRegExp,
    getAPI,
} from "upload-to-danbooru/utils.js";

const prefix = "http://example.com/";
const pageUrl = "http://example.net/post/123";
const frameUrl = "http://example.org/";
const srcUrl = "http://cdn.example.net/xxx.jpg";
const tab = {id: 123, index: 9, url: pageUrl};

describe("fixUrl()", function() {
    const testCases = [
        {
            name: "bilibili",
            url: "https://i0.hdslb.com/bfs/album/7cebff5e5f45b17a7aba554bef68b6e84a5f483a.jpg@240w_320h_1e_1c.webp",
            expected: "https://i0.hdslb.com/bfs/album/7cebff5e5f45b17a7aba554bef68b6e84a5f483a.jpg",
        },
        {
            name: "discord",
            url: "https://media.discordapp.net/attachments/310432830138089472/722011243862556772/omegalbert_2.png?width=400&height=274",
            expected: "https://media.discordapp.net/attachments/310432830138089472/722011243862556772/omegalbert_2.png",
        },
        {
            name: "pinterest",
            url: "https://i.pinimg.com/736x/73/e8/2d/73e82d272de705bb8fad33e89c0543e5.jpg",
            expected: "https://i.pinimg.com/originals/73/e8/2d/73e82d272de705bb8fad33e89c0543e5.jpg",
        },
        {
            name: "fanbox",
            url: "https://pixiv.pximg.net/c/1620x580_90_a2_g5/fanbox/public/images/creator/228078/cover/tHi9VtLFvJW4RS1h1DVpttRQ.jpeg",
            expected: "https://pixiv.pximg.net/fanbox/public/images/creator/228078/cover/tHi9VtLFvJW4RS1h1DVpttRQ.jpeg",
        },
        {
            name: "booth",
            url: "https://booth.pximg.net/c/300x300_a2_g5/14df0a03-2f5f-4292-bb5a-94a3881df4f0/i/2926394/24c0b971-8807-4d40-8089-bdbf34089056_base_resized.jpg",
            expected: "https://booth.pximg.net/14df0a03-2f5f-4292-bb5a-94a3881df4f0/i/2926394/24c0b971-8807-4d40-8089-bdbf34089056.jpg",
        },
        {
            name: "fantia",
            url: "https://c.fantia.jp/uploads/post/file/709449/main_324b4503-c64b-428b-875c-eaa273861268.png",
            expected: "https://c.fantia.jp/uploads/post/file/709449/324b4503-c64b-428b-875c-eaa273861268.png",
        },
    ];

    for (let t of testCases) {
        it(t.name, function() {
            should(fixUrl(t.url)).equal(t.expected);
        });
    }
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
});

describe("getAPI()", function() {
    const chrome = new Object();
    const browser = new Object();

    it("chrome", function() {
        const [api, isChrome] = getAPI({chrome});

        should(api).equal(chrome);
        should(isChrome).equal(true);
    });

    it("browser", function() {
        const [api, isChrome] = getAPI({chrome, browser});

        should(api).equal(browser);
        should(isChrome).equal(false);
    });
});
