import should from "should/as-function.js";

import {
    NotImplementedError,
    Settings,
    BrowserStorageSettings,
    InMemorySettings,
    FormManager,
} from "upload-to-danbooru/settings.js";


describe("Settings", function() {
    const settings = new Settings();

    it("get()", function() {
        return should(settings.get("test")).rejectedWith(NotImplementedError);
    });

    it("set()", function() {
        return should(settings.set({test: "value"})).rejectedWith(NotImplementedError);
    });
});

describe("BrowserStorageSettings", function() {
    it("get()", async function() {
        const storage = {a: "x", b: "y", c: "z"};
        const browser = {
            storage: {
                sync: {
                    async get(keys) {
                        const out = {};
                        for (const key of keys) {
                            out[key] = storage[key];
                        }
                        return out;
                    }
                }
            },
        };
        const settings = new BrowserStorageSettings(browser);

        should(await settings.get("a", "b")).deepEqual({
            a: "x",
            b: "y",
        });
    });

    it("set()", async function() {
        const storage = {a: "x", b: "y", c: "z"};
        const browser = {
            storage: {
                sync: {
                    async set(mapping) {
                        for (const [key, value] of Object.entries(mapping)) {
                            storage[key] = value;
                        }
                    }
                }
            },
        };
        const settings = new BrowserStorageSettings(browser);

        await settings.set({a: "0", b: "1"});

        should(storage).deepEqual({a: "0", b: "1", c: "z"});
    });
});

describe("InMemorySettings", function() {
    it("set() then get()", async function() {
        const settings = new InMemorySettings();
        const expected = {a: "x", b: "y", c: undefined};

        await settings.set({a: "x", b: "y"});

        const result = await settings.get("a", "b", "c");

        should(result).deepEqual(expected);
    });
});

describe("FormManager", function() {
    it("save()", async function() {
        const form = {
            a: {value: "x"},
            b: {value: "y"},
            c: {value: "z"},
        };
        const settings = new InMemorySettings();
        const formManager = new FormManager(form, settings);

        await formManager.save("a", "b");

        should(await settings.get("a", "b", "c")).deepEqual({a: "x", b: "y", c: undefined});
    });

    it("load()", async function() {
        const form = {
            a: {value: "discard"},
            b: {value: "discard"},
            c: {value: "discard"},
        };
        const defaults = {b: "test"};
        const settings = new InMemorySettings();
        const formManager = new FormManager(form, settings, defaults);

        await settings.set({a: "x"});
        await formManager.load("a", "b", "c");

        should(form).deepEqual({
            a: {value: "x"},
            b: {value: "test"},
            c: {value: ""},
        });
    });
});
