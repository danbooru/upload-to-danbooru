import should from "should/as-function.js";

import { UploadURLServiceImpl } from "upload-to-danbooru/uploadURLService.js";
import { RefererGetter } from "upload-to-danbooru/refererGetter.js";
import { UploadURLGenerator } from "upload-to-danbooru/uploadURLGenerator.js";
import { URLFixuper } from "upload-to-danbooru/urlFixuper.js";

class TestUploadURLGenerator extends UploadURLGenerator {
    constructor() {
        super();

        this.generateCalls = [];
    }

    generate(url, ref) {
        this.generateCalls.push([url, ref]);

        return `http://example.com?url=${url}&ref=${ref}`;
    }
}

class TestRefererGetter extends RefererGetter {
    constructor(fromOnClickDataResult) {
        super();

        this.fromOnClickDataResult = fromOnClickDataResult;
        this.fromOnClickDataCalls = [];
    }

    fromOnClickData(info) {
        this.fromOnClickDataCalls.push(info);

        return this.fromOnClickDataResult;
    }
}

class TestURLFixuper extends URLFixuper {
    constructor(fixResult) {
        super();

        this.fixResult = fixResult;
        this.fixCalls = [];
    }

    fix(url) {
        this.fixCalls.push(url);

        return this.fixResult;
    }
}

describe("UploadURLServiceImpl", function() {
    it("fromOnClickData() info.srcUrl", function() {
        const uploadURLGenerator = new TestUploadURLGenerator("test url");
        const refererGetter = new TestRefererGetter("test referer");
        const urlFixuper = new TestURLFixuper("test fixed url");
        const uploadURLService = new UploadURLServiceImpl(
            uploadURLGenerator,
            refererGetter,
            urlFixuper,
        );
        const srcUrl = "http://example.com/x.jpg";
        const info = {srcUrl};

        const url = uploadURLService.fromOnClickData(info);

        should(url).equal("http://example.com?url=test fixed url&ref=test referer");
        should(uploadURLGenerator.generateCalls).deepEqual([
            ["test fixed url", "test referer"],
        ]);
        should(urlFixuper.fixCalls).deepEqual([srcUrl]);
        should(refererGetter.fromOnClickDataCalls).deepEqual([info]);
    });

    it("fromOnClickData() info.linkUrl", function() {
        const uploadURLGenerator = new TestUploadURLGenerator("test url");
        const uploadURLService = new UploadURLServiceImpl(
            uploadURLGenerator,
        );
        const linkUrl = "http://example.com/x.jpg";
        const info = {linkUrl};

        const url = uploadURLService.fromOnClickData(info);

        should(url).equal("http://example.com?url=http://example.com/x.jpg&ref=undefined");
        should(uploadURLGenerator.generateCalls).deepEqual([
            [linkUrl, undefined],
        ]);
    });

    it("fromOnClickData() error", function() {
        const uploadURLService = new UploadURLServiceImpl();

        should(function ()  {uploadURLService.fromOnClickData({});} ).throw("info object must contain either srcUrl or linkUrl");
    });

    it("fromTab()", function() {
        const uploadURLGenerator = new TestUploadURLGenerator("test url");
        const uploadURLService = new UploadURLServiceImpl(
            uploadURLGenerator,
        );
        const tabUrl = "http://example.com/x.html";
        const tab = {url: tabUrl};

        const url = uploadURLService.fromTab(tab);

        should(url).equal("http://example.com?url=http://example.com/x.html&ref=undefined");
        should(uploadURLGenerator.generateCalls).deepEqual([
            [tabUrl, undefined],
        ]);
    });
});
