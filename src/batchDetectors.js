export class NotImplementedError extends Error {}

export class BatchDetector {
    constructor(document) {
        this.document = document;
    }

    get isDetectable() {
        return true;
    }

    get isBatch() {
        throw new NotImplementedError();
    }
}

export class Query {
    // eslint-disable-next-line no-unused-vars
    test(document) {
        throw new NotImplementedError();
    }
}

export class SingleElementQuery extends Query {
    constructor(query) {
        super();
        this.query = query;
    }

    test(document) {
        return !!document.querySelector(this.query);
    }
}

export class MultiElementQuery extends Query {
    constructor(query, minCount) {
        super();
        this.query = query;
        this.minCount = minCount || 0;
    }

    test(document) {
        return document.querySelectorAll(this.query).length > this.minCount;
    }
}

export class GenericBatchDetector extends BatchDetector {
    get queries() {
        throw new NotImplementedError();
    }

    get isBatch() {
        for (const query of this.queries) {
            if (query.test(this.document)) {
                return true;
            }
        }

        return false;
    }
}

export class TwitterBatchDetector extends BatchDetector {
    get isDetectable() {
        const path = this.document.location.pathname;

        return path.includes("/status/") && !path.includes("/photo/");
    }

    get isBatch() {
        let article = this.document.querySelector("article");

        if (article) {
            let totalImages = article.querySelectorAll("a img[src*='/media/']").length;
            let quotedImages = article.querySelectorAll("[role='link'] a img[src*='/media/']").length;

            return (totalImages - quotedImages) > 1;
        }

        return false;
    }
}

export class PixivBatchDetector extends GenericBatchDetector {
    get isDetectable() {
        const path = this.document.location.pathname;

        return path.includes("/artworks/");
    }

    get queries() {
        return [
            new MultiElementQuery("img[src*='i.pximg.net/img-master']", 1),
            new SingleElementQuery(".gtm-manga-viewer-preview-modal-open"),
            new SingleElementQuery("[aria-label='プレビュー']"),
            new SingleElementQuery("[aria-label='Preview']"),
        ];
    }
}

export class FanboxBatchDetector extends GenericBatchDetector {
    get isDetectable() {
        const path = this.document.location.pathname;

        return path.startsWith("/posts/");
    }

    get queries() {
        return [
            new SingleElementQuery("article figure"),
            new MultiElementQuery("img[src^='https://downloads.fanbox.cc/images/post/']", 1),
        ];
    }
}

export class LofterBatchDetector extends GenericBatchDetector {
    get isDetectable() {
        const path = this.document.location.pathname;

        return path.startsWith("/post/");
    }

    get queries() {
        return [
            new MultiElementQuery("a[bigimgsrc]", 1),
        ];
    }
}

export class NicoSeigaBatchDetector extends BatchDetector {
    get isDetectable() {
        const path = this.document.location.pathname;

        return path.startsWith("/watch/mg");
    }

    get isBatch() {
        return true;
    }
}

export class NijieBatchDetector extends GenericBatchDetector {
    get isDetectable() {
        const path = this.document.location.pathname;

        return /^\/view(?:_popup)?\.php/.test(path);
    }

    get queries() {
        const path = this.document.location.pathname;

        if (path.startsWith("/view_popup.php")) {
            return [
                new MultiElementQuery(".illust_click", 1),
                new MultiElementQuery(".box-shadow999", 1),
                new MultiElementQuery("img[src*='pic.nijie.net']", 1),
            ];
        }

        return [
            new MultiElementQuery("#gallery a[href*='view_popup.php']", 1),
            new SingleElementQuery("#img_diff a"),
        ];
    }
}

export class NijieSPBatchDetector extends GenericBatchDetector {
    get isDetectable() {
        const path = this.document.location.pathname;

        return /^\/view(?:_popup)?\.php/.test(path);
    }

    get queries() {
        const path = this.document.location.pathname;

        if (path.startsWith("/view_popup.php")) {
            return [
                new MultiElementQuery(".popup_illust", 1),
            ];
        }

        return [
            new SingleElementQuery("#manga"),
        ];
    }
}

export class SkebBatchDetector extends GenericBatchDetector {
    get isDetectable() {
        const path = this.document.location.pathname;

        return /^\/@.+?\/works\/.+/.test(path);
    }

    get queries() {
        return [
            new MultiElementQuery(".image-column .image .container", 1),
        ];
    }
}

export class PawooBatchDetector extends GenericBatchDetector {
    get isDetectable() {
        const path = this.document.location.pathname;

        return /^\/(@.+?|web\/statuses)\/\d+$/.test(path);
    }

    get queries() {
        return [
            new MultiElementQuery(".media-gallery__item-thumbnail", 1),
        ];
    }
}

const BatchDetectorByHost = {
    "cc": {
        "fanbox": {"*": FanboxBatchDetector},
    },
    "com": {
        "lofter": {"*": LofterBatchDetector},
        "twitter": {".": TwitterBatchDetector},
    },
    "info": {
        "nijie": {
            ".": NijieBatchDetector,
            "sp": {".": NijieSPBatchDetector},
        },
    },
    "jp": {
        "nicovideo": {
            "seiga": {".": NicoSeigaBatchDetector},
        },
        "skeb": {".": SkebBatchDetector},
    },
    "net": {
        "pawoo": {".": PawooBatchDetector},
        "pixiv": {
            "www": {".": PixivBatchDetector},
        },
    },
};

export function match(hostname) {
    const path = hostname.split(".");
    let rules = BatchDetectorByHost;

    while (path.length > 0) {
        const component = path.pop();
        const subrules = rules[component];

        if (subrules) {
            rules = subrules;
        } else {
            return rules["*"];
        }
    }

    return rules["."];
}
