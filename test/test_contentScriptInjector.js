import should from "should/as-function.js";

import {
    NotImplementedError,
    ContentScriptInjector,
    BrowserContentScriptInjector,
    ChromeContentScriptInjector,
    BatchDetectorInjector,
} from "upload-to-danbooru/contentScriptInjector.js";
import {
    TabMessenger,
    TabMessagingProtocol,
} from "upload-to-danbooru/messaging.js";
import { Sleeper } from "upload-to-danbooru/sleeper.js";

describe("ContentScriptInjector", function() {
    it("inject()", function() {
        const injector = new ContentScriptInjector();

        should(injector.inject(123, "test.js")).rejectedWith(NotImplementedError);
    });
});

describe("BrowserContentScriptInjector", function() {
    it("inject()", async function() {
        let injectedTabId, injectedDetails;
        const browser = {
            tabs: {
                async executeScript(tabId, details) {
                    injectedTabId = tabId;
                    injectedDetails = details;
                }
            },
        };
        const injector = new BrowserContentScriptInjector(browser);

        await injector.inject(123, "test.js");

        should(injectedTabId).equal(123);
        should(injectedDetails).deepEqual({file: "test.js"});
    });
});

describe("ChromeContentScriptInjector", function() {
    it("inject()", async function() {
        let injectedInjection;
        const chrome = {
            scripting: {
                async executeScript(injection) {
                    injectedInjection = injection;
                }
            },
        };
        const injector = new ChromeContentScriptInjector(chrome);

        await injector.inject(123, "test.js");

        should(injectedInjection).deepEqual({
            target: {tabId: 123},
            files: ["test.js"],
        });
    });
});

describe("BatchDetectorInjector", function() {
    class TestContentScriptInjector extends ContentScriptInjector {
        constructor() {
            super();

            this.injections = [];
        }

        async inject(tabId, contentScript) {
            this.injections.push({tabId, contentScript});
        }
    }

    class TestTabMessenger extends TabMessenger {
        constructor(responses) {
            super();

            this.responses = responses;
        }
        async send(tabId, type) {
            return this.responses[tabId][type];
        }
    }

    class TestSleeper extends Sleeper {
        constructor() {
            super();

            this.sleeped = 0;
        }

        async sleep(ms) {
            this.sleeped += ms;
        }
    }

    it("already injected", async function() {
        const injector = new TestContentScriptInjector();
        const messenger = new TestTabMessenger({
            123: {ping: {pong: true}},
        });
        const proto = new TabMessagingProtocol(messenger);
        const sleeper = new TestSleeper();
        const bdi = new BatchDetectorInjector(
            "test.js",
            injector,
            proto,
            sleeper,
            250,
            4,
        );

        await bdi.inject(123);

        should(injector.injections).deepEqual([]);
        should(sleeper.sleeped).equal(0);
    });

    it("inject fast", async function() {
        let i = 0;
        const injector = new TestContentScriptInjector();
        const messenger = new TestTabMessenger({
            123: {
                get ping() {
                    if (i == 0) {
                        i++;
                        return undefined;
                    }
                    return {pong: true};
                }
            },
        });
        const proto = new TabMessagingProtocol(messenger);
        const sleeper = new TestSleeper();
        const bdi = new BatchDetectorInjector(
            "test.js",
            injector,
            proto,
            sleeper,
            250,
            4,
        );

        await bdi.inject(123);

        should(injector.injections).deepEqual([
            {tabId: 123, contentScript: "test.js"},
        ]);
        should(sleeper.sleeped).equal(0);
    });

    it("inject slow", async function() {
        let i = 0;
        const injector = new TestContentScriptInjector();
        const messenger = new TestTabMessenger({
            123: {
                get ping() {
                    if (i < 3) {
                        i++;
                        return undefined;
                    }
                    return {pong: true};
                }
            },
        });
        const proto = new TabMessagingProtocol(messenger);
        const sleeper = new TestSleeper();
        const bdi = new BatchDetectorInjector(
            "test.js",
            injector,
            proto,
            sleeper,
            250,
            4,
        );

        await bdi.inject(123);

        should(injector.injections).deepEqual([
            {tabId: 123, contentScript: "test.js"},
        ]);
        should(sleeper.sleeped).equal(500);
    });

    it("inject timeout", function() {
        const injector = new TestContentScriptInjector();
        const messenger = new TestTabMessenger({
            123: {ping: undefined},
        });
        const proto = new TabMessagingProtocol(messenger);
        const sleeper = new TestSleeper();
        const bdi = new BatchDetectorInjector(
            "test.js",
            injector,
            proto,
            sleeper,
        );

        should(bdi.inject(123)).rejectedWith("failed to inject batch detector");
    });
});
