import should from "should/as-function.js";
import { join } from "path";
import { tmpdir } from "os";
import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { chromeifyManifest, chromeifyManifestFile } from "../chromeifyManifest.impl.js";

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
        "commands": {
            "_execute_page_action": {
                "suggested_key": {
                    "default": "Alt+Shift+D"
                }
            }
        },
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
            "activeTab",
            "contextMenus",
            "storage",
        ],
        "commands": {
            "_execute_action": {
                "suggested_key": {
                    "default": "Alt+Shift+D"
                }
            }
        },
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

describe("chromeifyManifestFile()", function() {
    let tmp;

    before(async function () {
        tmp = await mkdtemp(join(tmpdir(), "test-chromeifyManifestFile-"));
    });

    after(async function () {
        await rm(tmp, {"recursive": true, "force": true});
    });

    it("", async function() {
        const manifest = makeManifest();
        const path = join(tmp, "manifest.json");

        await writeFile(path, JSON.stringify(manifest), {"encoding": "utf8"});
        await chromeifyManifestFile(path, manifest);

        const result = JSON.parse(await readFile(path, {"encoding": "utf8"}));

        should(result).deepEqual(makeChromeManifest());
    });
});
