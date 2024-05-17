import should from "should/as-function.js";

import {
    asBool,
    getPageActionMatchRegExp,
    getAPI,
} from "upload-to-danbooru/utils.js";

describe("getPageActionMatchRegExp()", function() {
    it("", function() {
        const globs = [
            "https://x.com/*/status/*",
            "https://www.pixiv.net/artworks/*",
            "https://*.tumblr.com/post/*",
        ];
        const result = getPageActionMatchRegExp(globs);

        should(result).equal("^https://x\\.com/.*/status/.*|^https://www\\.pixiv\\.net/artworks/.*|^https://.*\\.tumblr\\.com/post/.*");
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

describe("asBool()", function() {
    const fallback = new Object();
    const values = [
        [undefined, fallback],
        ["", fallback],
        ["yes", true],
        ["True", true],
        ["ON", true],
        ["t", true],
        ["y", true],
        ["no", false],
        ["off", false],
    ];

    for (let [value, expected] of values) {
        it(`${value} -> ${expected}`, function() {
            should(asBool(value, fallback)).equal(expected);
        });
    }

    it("fallback false", function() {
        should(asBool(undefined, false)).equal(false);
    });

    it("fallback true", function() {
        should(asBool(undefined, true)).equal(true);
    });
});
