import should from "should/as-function.js";

import { UploadURLGeneratorImpl } from "upload-to-danbooru/uploadURLGenerator.js";

describe("UploadURLGeneratorImpl", function() {
    const prefix = "http://example.com/";
    const pageUrl = "http://example.net/post/123";
    const srcUrl = "http://cdn.example.net/xxx.jpg";
    const uploadURLGenerator = new UploadURLGeneratorImpl(prefix);

    describe("generate() same prefix", function() {
        it("src", function() {
            const url = uploadURLGenerator.generate("http://example.com/data/360x360/aa/aa/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.jpg");

            should(url.href).equal("http://example.com/uploads/new");
        });

        it("ref", function() {
            const url = uploadURLGenerator.generate(
                "http://cdn.example.com/data/360x360/aa/aa/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.jpg",
                "http://example.com/posts/123456789",
            );

            should(url.href).equal("http://example.com/uploads/new");
        });
    });

    it("generate() non http", function() {
        const url = uploadURLGenerator.generate("chrome://newtab");

        should(url.href).equal("http://example.com/uploads/new");
    });

    it("generate() no ref", function() {
        const url = uploadURLGenerator.generate(srcUrl);

        should(url.href).equal("http://example.com/uploads/new?url=http%3A%2F%2Fcdn.example.net%2Fxxx.jpg");
    });

    it("generate() with ref", function() {
        const url = uploadURLGenerator.generate(srcUrl, pageUrl);

        should(url.href).equal("http://example.com/uploads/new?url=http%3A%2F%2Fcdn.example.net%2Fxxx.jpg&ref=http%3A%2F%2Fexample.net%2Fpost%2F123");
    });
});
