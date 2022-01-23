import should from "should/as-function.js";

import {
    NotImplementedError,
    TabMessenger,
    BrowserTabMessenger,
    ChromeTabMessenger,
    TabMessagingProtocol,
} from "upload-to-danbooru/messaging.js";

describe("TabMessenger", function() {
    it("send()", function() {
        const tm = new TabMessenger();

        should(tm.send()).rejectedWith(NotImplementedError);
    });
});

describe("BrowserTabMessenger", function() {
    it("send()", async function() {
        const browser = {
            tabs: {
                async sendMessage(tabId, request) {
                    return {test: "response", tabId, request};
                }
            },
        };
        const tm = new BrowserTabMessenger(browser);
        const response = await tm.send(123, "test", {"aaa": "xxx"});

        should(response).deepEqual({
            test: "response",
            tabId: 123,
            request: {
                type: "test",
                payload: {"aaa": "xxx"},
            },
        });
    });
});

describe("ChromeTabMessenger", function() {
    it("send() ok", async function() {
        const chrome = {
            tabs: {
                async sendMessage(tabId, request, callback) {
                    callback({test: "response", tabId, request});
                }
            },
        };
        const tm = new ChromeTabMessenger(chrome);
        const response = await tm.send(123, "test", {"aaa": "xxx"});

        should(response).deepEqual({
            test: "response",
            tabId: 123,
            request: {
                type: "test",
                payload: {"aaa": "xxx"},
            },
        });
    });

    it("send() no response", async function() {
        const chrome = {
            runtime: {lastError: undefined},
            tabs: {
                async sendMessage(tabId, request, callback) {
                    callback(undefined);
                }
            },
        };
        const tm = new ChromeTabMessenger(chrome);
        const response = await tm.send(123, "test", {"aaa": "xxx"});

        should(response).equal(undefined);
    });

    it("send() error", function() {
        const error = new Error("test");
        const chrome = {
            runtime: {lastError: error},
            tabs: {
                sendMessage(tabId, request, callback) {
                    callback(undefined);
                }
            },
        };
        const tm = new ChromeTabMessenger(chrome);

        should(tm.send(123, "test", {"aaa": "xxx"})).rejectedWith(error);
    });
});

describe("TabMessagingProtocol", function() {
    class TestTabMessenger extends TabMessenger {
        constructor(responses) {
            super();

            this.responses = responses;
        }
        async send(tabId, type) {
            const response = this.responses[tabId][type];

            if (response instanceof Error) {
                throw response;
            }

            return response;
        }
    }

    const tm = new TestTabMessenger({
        0: {},
        1: {getReferrer: {referrer: "http://example.com"}},
        2: {getReferrer: {referrer: ""}},
        3: {detectBatch: {isBatch: true}},
        4: {detectBatch: {isBatch: false}},
        5: {ping: {pong: true}},
        6: {ping: new Error("test error")},
    });
    const proto = new TabMessagingProtocol(tm);

    it("getReferrer() empty", async function() {
        should(await proto.getReferrer(2)).equal("");
    });

    it("getReferrer() ok", async function() {
        should(await proto.getReferrer(1)).equal("http://example.com");
    });

    it("getReferrer() empty", async function() {
        should(await proto.getReferrer(2)).equal("");
    });

    it("getReferrer() no response", async function() {
        should(await proto.getReferrer(0)).equal("");
    });

    it("isBatch() true", async function() {
        should(await proto.isBatch(3)).equal(true);
    });

    it("isBatch() false", async function() {
        should(await proto.isBatch(4)).equal(false);
    });

    it("isBatch() no response", async function() {
        should(await proto.isBatch(0)).equal(false);
    });

    it("ping() ok", async function() {
        should(await proto.ping(5)).equal(true);
    });

    it("ping() empty", async function() {
        should(await proto.ping(0)).equal(false);
    });

    it("ping() error", function() {
        should(proto.ping(6)).rejectedWith("test error");
    });
});
