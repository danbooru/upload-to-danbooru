import should from "should/as-function.js";

import {
    NotImplementedError,
    BatchDetector,
    Query,
    SingleElementQuery,
    MultiElementQuery,
    GenericBatchDetector,
    TwitterBatchDetector,
    PixivBatchDetector,
    FanboxBatchDetector,
    LofterBatchDetector,
    NicoSeigaBatchDetector,
    NijieBatchDetector,
    NijieSPBatchDetector,
    SkebBatchDetector,
    PawooBatchDetector,
    match,
} from "upload-to-danbooru/batchDetectors.js";

const any = new Object();
const testQuery = "#gallery .image";

function q2a(queries) {
    const out = [];

    for (const query of queries) {
        out.push({cls: query.constructor.name, q: query.query, n: query.minCount || 0});
    }

    return out;
}

function m(q, n) {
    return {cls: "MultiElementQuery", q, n};
}

function s(q) {
    return {cls: "SingleElementQuery", q, n: 0};
}

describe("BatchDetector", function() {
    const bd = new BatchDetector(any);

    it("isDetectable", function() {
        should(bd.isDetectable).equal(true);
    });

    it("isBatch", function() {
        should(() => bd.isBatch).throw(NotImplementedError);
    });
});

describe("Query", function() {
    const query = new Query();

    it("test()", function() {
        should(() => query.test(any)).throw(NotImplementedError);
    });
});

describe("SingleElementQuery", function() {
    function querySelector(selector) {
        return (selector === testQuery) ? any : undefined;
    }

    it("test() ok", function() {
        const query = new SingleElementQuery(testQuery);

        should(query.test({querySelector})).equal(true);
    });

    it("test() empty", function() {
        const query = new SingleElementQuery("#xxx");

        should(query.test({querySelector})).equal(false);
    });
});

describe("MultiElementQuery", function() {
    function querySelectorAll(selector) {
        return (selector === testQuery) ? [any] : [];
    }

    it("test() >0", function() {
        const query = new MultiElementQuery(testQuery);

        should(query.test({querySelectorAll})).equal(true);
    });

    it("test() >1", function() {
        const query = new MultiElementQuery(testQuery, 1);

        should(query.test({querySelectorAll})).equal(false);
    });

    it("test() empty", function() {
        const query = new MultiElementQuery("#xxx");

        should(query.test({querySelectorAll})).equal(false);
    });
});

describe("GenericBatchDetector", function() {
    it("queries", function() {
        const bd = new GenericBatchDetector(any);

        should(() => bd.queries).throw(NotImplementedError);
    });

    class TestGenericBatchDetector extends GenericBatchDetector {
        constructor(document, queries) {
            super(document);
            this._queries = queries;
        }
        get queries() {
            return this._queries;
        }
    }

    class TestQuery extends Query {
        constructor(result) {
            super();
            this.result = result;
        }

        test(document) {
            if (document !== any) {
                throw Error("Query.test() must be called with document object");
            }

            return this.result;
        }
    }

    it("isBatch() no results", function() {
        const bd = new TestGenericBatchDetector(any, [new TestQuery(false)]);

        should(bd.isBatch).equal(false);
    });

    it("isBatch() has results", function() {
        const bd = new TestGenericBatchDetector(any, [new TestQuery(false), new TestQuery(true)]);

        should(bd.isBatch).equal(true);
    });
});

describe("TwitterBatchDetector", function() {
    it("isDetectable status", function() {
        const location = new URL("https://twitter.com/HIDEO_KOJIMA_EN/status/1240545404346716160");
        const bd = new TwitterBatchDetector({location});

        should(bd.isDetectable).equal(true);
    });

    it("isDetectable photo", function() {
        const location = new URL("https://twitter.com/HIDEO_KOJIMA_EN/status/1240545404346716160/photo/1");
        const bd = new TwitterBatchDetector({location});

        should(bd.isDetectable).equal(false);
    });

    it("isDetectable other", function() {
        const location = new URL("https://twitter.com/HIDEO_KOJIMA_EN/media");
        const bd = new TwitterBatchDetector({location});

        should(bd.isDetectable).equal(false);
    });

    function makeTestDocument(imgs, quoted) {
        function querySelectorAll(query) {
            return {
                "a img[src*='/media/']": Array(imgs + quoted).fill(any),
                "[role='link'] a img[src*='/media/']": Array(quoted).fill(any),
            }[query] || [];
        }

        const article = {querySelectorAll};

        function querySelector(query) {
            return {"article": article}[query] || [];
        }

        return {querySelector};
    }

    const table = [
        ["no_img", "no_qoute", 0, 0, false],
        ["one_img", "no_qoute", 1, 0, false],
        ["many_img", "no_qoute", 3, 0, true],
        ["no_img", "one_qoute", 0, 1, false],
        ["one_img", "one_qoute", 1, 1, false],
        ["many_img", "one_qoute", 3, 1, true],
        ["no_img", "many_qoute", 0, 2, false],
        ["one_img", "many_qoute", 1, 2, false],
        ["many_img", "many_qoute", 3, 2, true],
    ];

    for (const [imgName, quoteName, imgCount, quoteCount, expected] of table) {
        it(`isBatch ${imgName} ${quoteName}`, function() {
            const document = makeTestDocument(imgCount, quoteCount);
            const bd = new TwitterBatchDetector(document);

            should(bd.isBatch).equal(expected);
        });
    }
});

describe("PixivBatchDetector", function() {
    it("isDetectable jp post", function() {
        const location = new URL("https://www.pixiv.net/artworks/46260979");
        const bd = new PixivBatchDetector({location});

        should(bd.isDetectable).equal(true);
    });

    it("isDetectable en post", function() {
        const location = new URL("https://www.pixiv.net/en/artworks/46260979");
        const bd = new PixivBatchDetector({location});

        should(bd.isDetectable).equal(true);
    });

    it("isDetectable other", function() {
        const location = new URL("https://www.pixiv.net/en/users/7013");
        const bd = new PixivBatchDetector({location});

        should(bd.isDetectable).equal(false);
    });

    it("queries", function() {
        const bd = new PixivBatchDetector(any);

        should(q2a(bd.queries)).deepEqual([
            m("img[src*='i.pximg.net/img-master']", 1),
            s(".gtm-manga-viewer-preview-modal-open"),
            s("[aria-label='プレビュー']"),
            s("[aria-label='Preview']"),
        ]);
    });
});


describe("FanboxBatchDetector", function() {
    it("isDetectable ok", function() {
        const location = new URL("https://setamo.fanbox.cc/posts/1265081");
        const bd = new FanboxBatchDetector({location});

        should(bd.isDetectable).equal(true);
    });

    it("isDetectable other", function() {
        const location = new URL("https://setamo.fanbox.cc/plans");
        const bd = new FanboxBatchDetector({location});

        should(bd.isDetectable).equal(false);
    });

    it("queries", function() {
        const bd = new FanboxBatchDetector(any);

        should(q2a(bd.queries)).deepEqual([
            s("article figure"),
            m("img[src^='https://downloads.fanbox.cc/images/post/']", 1),
        ]);
    });
});

describe("LofterBatchDetector", function() {
    it("isDetectable ok", function() {
        const location = new URL("https://nemusan.lofter.com/post/398136_1cb573fe1");
        const bd = new LofterBatchDetector({location});

        should(bd.isDetectable).equal(true);
    });

    it("isDetectable other", function() {
        const location = new URL("https://nemusan.lofter.com/view");
        const bd = new LofterBatchDetector({location});

        should(bd.isDetectable).equal(false);
    });

    it("queries", function() {
        const bd = new LofterBatchDetector(any);

        should(q2a(bd.queries)).deepEqual([
            m("a[bigimgsrc]", 1),
        ]);
    });
});

describe("NicoSeigaBatchDetector", function() {
    it("isDetectable manga", function() {
        const location = new URL("https://seiga.nicovideo.jp/watch/mg159057");
        const bd = new NicoSeigaBatchDetector({location});

        should(bd.isDetectable).equal(true);
    });

    it("isDetectable single", function() {
        const location = new URL("https://seiga.nicovideo.jp/seiga/im2740553");
        const bd = new NicoSeigaBatchDetector({location});

        should(bd.isDetectable).equal(false);
    });

    it("isDetectable other", function() {
        const location = new URL("https://seiga.nicovideo.jp/user/illust/18424396");
        const bd = new NicoSeigaBatchDetector({location});

        should(bd.isDetectable).equal(false);
    });

    it("isBatch", function() {
        const bd = new NicoSeigaBatchDetector(any);

        should(bd.isBatch).equal(true);
    });
});

describe("NijieBatchDetector", function() {
    it("isDetectable view", function() {
        const location = new URL("https://nijie.info/view.php?id=88014");
        const bd = new NijieBatchDetector({location});

        should(bd.isDetectable).equal(true);
    });

    it("isDetectable viewPopup", function() {
        const location = new URL("https://nijie.info/view_popup.php?id=88014");
        const bd = new NijieBatchDetector({location});

        should(bd.isDetectable).equal(true);
    });

    it("isDetectable other", function() {
        const location = new URL("https://nijie.info/members_illust.php?id=4286");
        const bd = new NijieBatchDetector({location});

        should(bd.isDetectable).equal(false);
    });

    it("queries view", function() {
        const location = new URL("https://nijie.info/view.php?id=88014");
        const bd = new NijieBatchDetector({location});

        should(q2a(bd.queries)).deepEqual([
            m("#gallery a[href*='view_popup.php']", 1),
            s("#img_diff a"),
        ]);
    });

    it("queries viewPopup", function() {
        const location = new URL("https://nijie.info/view_popup.php?id=88014");
        const bd = new NijieBatchDetector({location});

        should(q2a(bd.queries)).deepEqual([
            m(".illust_click", 1),
            m(".box-shadow999", 1),
            m("img[src*='pic.nijie.net']", 1),
        ]);
    });
});

describe("NijieBatchDetector", function() {
    it("isDetectable view", function() {
        const location = new URL("https://sp.nijie.info/view.php?id=88014");
        const bd = new NijieSPBatchDetector({location});

        should(bd.isDetectable).equal(true);
    });

    it("isDetectable viewPopup", function() {
        const location = new URL("https://sp.nijie.info/view_popup.php?id=88014");
        const bd = new NijieSPBatchDetector({location});

        should(bd.isDetectable).equal(true);
    });

    it("isDetectable other", function() {
        const location = new URL("https://sp.nijie.info/view_comment.php?id=88014");
        const bd = new NijieSPBatchDetector({location});

        should(bd.isDetectable).equal(false);
    });

    it("queries view", function() {
        const location = new URL("https://sp.nijie.info/view.php?id=88014");
        const bd = new NijieSPBatchDetector({location});

        should(q2a(bd.queries)).deepEqual([
            s("#manga"),
        ]);
    });

    it("queries viewPopup", function() {
        const location = new URL("https://sp.nijie.info/view_popup.php?id=88014");
        const bd = new NijieSPBatchDetector({location});

        should(q2a(bd.queries)).deepEqual([
            m(".popup_illust", 1),
        ]);
    });
});

describe("SkebBatchDetector", function() {
    it("isDetectable ok", function() {
        const location = new URL("https://skeb.jp/@ebimomomo/works/45");
        const bd = new SkebBatchDetector({location});

        should(bd.isDetectable).equal(true);
    });

    it("isDetectable other", function() {
        const location = new URL("https://skeb.jp/@tukushiA");
        const bd = new SkebBatchDetector({location});

        should(bd.isDetectable).equal(false);
    });

    it("isBatch", function() {
        const bd = new SkebBatchDetector(any);

        should(q2a(bd.queries)).deepEqual([
            m(".image-column .image .container", 1),
        ]);
    });
});

describe("PawooBatchDetector", function() {
    it("isDetectable ok", function() {
        const location = new URL("https://pawoo.net/@mayumani/107553674613166646");
        const bd = new PawooBatchDetector({location});

        should(bd.isDetectable).equal(true);
    });

    it("isDetectable ok alt", function() {
        const location = new URL("https://pawoo.net/web/statuses/107553674613166646");
        const bd = new PawooBatchDetector({location});

        should(bd.isDetectable).equal(true);
    });

    it("isDetectable other", function() {
        const location = new URL("https://pawoo.net/web/accounts/9657");
        const bd = new PawooBatchDetector({location});

        should(bd.isDetectable).equal(false);
    });

    it("isDetectable other2", function() {
        const location = new URL("https://pawoo.net/web/statuses/107553674613166646/favourites");
        const bd = new PawooBatchDetector({location});

        should(bd.isDetectable).equal(false);
    });

    it("isBatch", function() {
        const bd = new PawooBatchDetector(any);

        should(q2a(bd.queries)).deepEqual([
            m(".media-gallery__item-thumbnail", 1),
        ]);
    });
});

describe("match()", function() {
    const table = [
        ["twitter.com", TwitterBatchDetector],
        ["test.twitter.com", undefined],
        ["pixiv.net", undefined],
        ["test.pixiv.net", undefined],
        ["www.pixiv.net", PixivBatchDetector],
        ["fanbox.cc", undefined],
        ["test.fanbox.cc", FanboxBatchDetector],
        ["lofter.com", undefined],
        ["test.lofter.com", LofterBatchDetector],
        ["nicovideo.jp", undefined],
        ["www.nicovideo.jp", undefined],
        ["seiga.nicovideo.jp", NicoSeigaBatchDetector],
        ["nijie.info", NijieBatchDetector],
        ["sp.nijie.info", NijieSPBatchDetector],
        ["test.nijie.info", undefined],
        ["skeb.jp", SkebBatchDetector],
        ["test.skeb.jp", undefined],
        ["pawoo.net", PawooBatchDetector],
        ["test.pawoo.net", undefined],
        ["example.com", undefined],
        ["", undefined],
    ];

    for (const [host, expectedCls] of table) {
        const name = expectedCls ? expectedCls.name : "[none]";

        it(`${host || "[empty]"} -> ${name}`, function() {
            const cls = match(host);

            should(cls).equal(expectedCls);
        });
    }
});
