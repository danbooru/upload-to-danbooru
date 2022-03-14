import should from "should/as-function.js";
import { PassThrough, Readable } from "stream";

import {
    chromeifyManifest,
    parseArgs,
    transformStream,
} from "../chromeifyManifest.impl.js";

function makeManifest() {
    return {
        "manifest_version": 2,
        "name": "Test",
        "version": "0.0.1",
        "icons": {
            "16": "test.png",
        },
        "page_action": {
            "default_icon": {
                "16": "test.png",
            },
            "default_title": "Test",
            "show_matches": [
                "https://example.com/*",
                "https://example.net/*",
                "https://example.org/*",
            ],
        },
        "options_ui": {
            "page": "options.html",
            "browser_style": true,
        },
        "background": {
            "page": "background.html",
        },
        "permissions": [
            "activeTab",
            "contextMenus",
            "storage",
        ],
        "browser_specific_settings": {
            "gecko": {
                "id": "admin@localhost",
                "strict_min_version": "59.0",
            },
        },
    };
}

function makeChromeManifest() {
    return {
        "manifest_version": 3,
        "name": "Test",
        "version": "0.0.1",
        "icons": {
            "16": "test.png",
        },
        "options_ui": {
            "page": "options.html",
        },
        "background": {
            "service_worker": "background.js",
            "type": "module",
        },
        "permissions": [
            "declarativeContent",
            "scripting",
            "activeTab",
            "contextMenus",
            "storage",
        ],
        "minimum_chrome_version": "97",
        "action": {
            "default_icon": {
                "16": "test.png",
            },
            "default_title": "Test",
            "show_matches": [
                "https://example.com/*",
                "https://example.net/*",
                "https://example.org/*",
            ],
        },
    };
}

describe("chromeifyManifest()", function() {
    it("", function() {
        const result = chromeifyManifest(makeManifest());

        should(result).deepEqual(makeChromeManifest());
    });
});

describe("parseArgs()", function() {
    it("0", function() {
        should(parseArgs([])).deepEqual(["-", "-"]);
    });

    it("1", function() {
        should(parseArgs(["test"])).deepEqual(["test", "-"]);
    });

    it("2", function() {
        should(parseArgs(["test", "tset"])).deepEqual(["test", "tset"]);
    });

    it("n", function() {
        should(parseArgs(["test", "tset", "?"])).deepEqual(["test", "tset"]);
    });
});

describe("transformStream()", function() {
    it("", function(done) {
        const chunks = [];
        const instream = Readable.from([JSON.stringify(makeManifest())]);
        const outstream = new PassThrough();
        const expected = JSON.stringify(makeChromeManifest(), null, 4) + "\n";

        outstream.on("data", (chunk) => {
            chunks.push(chunk);
        });

        outstream.on("finish", () => {
            should(chunks.join("")).equals(expected);
            done();
        });

        transformStream(instream, outstream);
    });
});
