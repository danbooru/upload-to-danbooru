import should from "should/as-function.js";

import { RefererGetterImpl } from "upload-to-danbooru/refererGetter.js";

describe("RefererGetterImpl", function() {
    const refererGetter = new RefererGetterImpl();
    const prefix = "http://example.com/";
    const pageUrl = "http://example.net/post/123";
    const frameUrl = "http://example.org/";
    const srcUrl = "http://cdn.example.net/xxx.jpg";

    it("fromOnClickData() page", function() {
        const ref = refererGetter.fromOnClickData({srcUrl, pageUrl});

        should(ref).equal(pageUrl);
    });

    it("fromOnClickData() frame", function() {
        const ref = refererGetter.fromOnClickData({srcUrl, pageUrl: srcUrl, frameUrl});

        should(ref).equal(frameUrl);
    });

    it("fromOnClickData() no frame", function() {
        const ref = refererGetter.fromOnClickData({srcUrl, pageUrl: srcUrl});

        should(ref).equal(srcUrl);
    });

    it("fromOnClickData() link", function() {
        const refererGetter = new RefererGetterImpl(/^http:\/\/example.net\/post\//);

        const ref = refererGetter.fromOnClickData(
            {srcUrl, pageUrl: prefix, linkUrl: pageUrl},
        );

        should(ref).equal(pageUrl);
    });
});
