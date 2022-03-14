import should from "should/as-function.js";

import {
    fixUrl,
    makeUploadUrl,
    getReferer,
    getPageActionMatchRegExp,
    getAPI,
} from "upload-to-danbooru/utils.js";

const prefix = "http://example.com/";
const pageUrl = "http://example.net/post/123";
const frameUrl = "http://example.org/";
const srcUrl = "http://cdn.example.net/xxx.jpg";

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

describe("makeUploadUrl()", function() {
    it("no ref", function() {
        const url = makeUploadUrl(prefix, srcUrl);

        should(url.href).equal("http://example.com/uploads/new?url=http%3A%2F%2Fcdn.example.net%2Fxxx.jpg");
    });

    it("with ref", function() {
        const url = makeUploadUrl(prefix, srcUrl, pageUrl);

        should(url.href).equal("http://example.com/uploads/new?url=http%3A%2F%2Fcdn.example.net%2Fxxx.jpg&ref=http%3A%2F%2Fexample.net%2Fpost%2F123");
    });
});

describe("getReferer()", function() {
    it("page", function() {
        const ref = getReferer({srcUrl, pageUrl});

        should(ref).equal(pageUrl);
    });

    it("frame", function() {
        const ref = getReferer({srcUrl, pageUrl: srcUrl, frameUrl});

        should(ref).equal(frameUrl);
    });

    it("no frame", function() {
        const ref = getReferer({srcUrl, pageUrl: srcUrl});

        should(ref).equal(srcUrl);
    });

    it("link", function() {
        const ref = getReferer(
            {srcUrl, pageUrl: prefix, linkUrl: pageUrl},
            /^http:\/\/example.net\/post\//,
        );

        should(ref).equal(pageUrl);
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

describe("getAPI()", function() {
    const chrome = new Object();

    it("chrome", function() {
        const [api, isChrome, isAndroid] = getAPI({chrome});

        should(api).equal(chrome);
        should(isChrome).equal(true);
        should(isAndroid).equal(false);
    });

    it("browser", function() {
        const browser = {contextMenus: {}};
        const [api, isChrome, isAndroid] = getAPI({chrome, browser});

        should(api).equal(browser);
        should(isChrome).equal(false);
        should(isAndroid).equal(false);
    });

    it("android", function() {
        const browser = {};
        const [api, isChrome, isAndroid] = getAPI({chrome, browser});

        should(api).equal(browser);
        should(isChrome).equal(false);
        should(isAndroid).equal(true);
    });
});
