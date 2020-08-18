export const pixivCountQueries = [
    "img[src*='i.pximg.net/img-master']",
];
export const pixivExistsQueries = [
    ".gtm-manga-viewer-preview-modal-open",
    "[aria-label='プレビュー']",
    "[aria-label='Preview']",
];
export const nijiePopupCountQueries = [
    ".illust_click",
    ".box-shadow999",
    "img[src*='pic.nijie.net']",
];
export const nijiePopupExistsQueries = [
];
export const nijieCountQueries = [
    "#gallery a[href*='view_popup.php']",
];
export const nijieExistsQueries = [
    "#img_diff a",
];

export class TabUtils {
    constructor(tab, api) {
        this.tab = tab;
        this.api = api;
    }

    makeUrl(prefix, batch) {
        return (batch ? makeBatchUrl : makePostUrl)(prefix, this.tab.url);
    }

    openPage(url, current, background) {
        if (current) {
            return this.api.update(this.tab.id, {url});
        }

        return this.api.create({
            active: !background,
            openerTabId: this.tab.id,
            url: url,
        });
    }

    async getReferrer() {
        const code = "document.referrer";

        try {
            const results = await this.api.executeScript(this.tab.id, {code});

            return results.find(Boolean) || "";
        } catch (err) {
            console.error("failed to get referrer", err);
        }

        return "";
    }

    async isGenericBatch(existsQueries, countQueries) {
        for (const query of existsQueries) {
            const code = `!!document.querySelector("${query}")`;
            const results = await this.api.executeScript(this.tab.id, {code});
            const isBatch = results.find(Boolean);

            if (isBatch) {
                return true;
            }
        }

        for (const query of countQueries) {
            const code = `document.querySelectorAll("${query}").length > 1`;
            const results = await this.api.executeScript(this.tab.id, {code});
            const isBatch = results.find(Boolean);

            if (isBatch) {
                return true;
            }
        }

        return false;
    }

    isNijieBatch() {
        if (this.tab.url.includes("view_popup.php")) {
            return this.isGenericBatch(nijiePopupExistsQueries, nijiePopupCountQueries);
        }

        return this.isGenericBatch(nijieExistsQueries, nijieCountQueries);
    }

    isPixivBatch() {
        return this.isGenericBatch(pixivExistsQueries, pixivCountQueries);
    }

    isNicoSeigaBatch() {
        return this.tab.url.includes("watch/mg");
    }

    async isTwitterBatch() {
        if (this.tab.url.includes("/photo/")) {
            return false;
        }

        const code = "document.querySelector('article').querySelectorAll(\"a img[src*='/media/']\").length > 1";
        const results = await this.api.executeScript(this.tab.id, {code});

        return !!results.find(Boolean);
    }

    async isBatch() {
        const url = this.tab.url;
        const map = {
            "https://nijie.info/": "isNijieBatch",
            "https://seiga.nicovideo.jp/": "isNicoSeigaBatch",
            "https://twitter.com/": "isTwitterBatch",
            "https://www.pixiv.net/": "isPixivBatch",
        };

        for (const [prefix, fn] of Object.entries(map)) {
            if (url.startsWith(prefix)) {
                return await this[fn]();
            }
        }

        return false;
    }
}

export function makeBatchUrl(prefix, url) {
    const uploadUrl = new URL("uploads/batch", prefix);

    uploadUrl.searchParams.set("url", url);

    return uploadUrl;
}

export function makePostUrl(prefix, url, ref) {
    const uploadUrl = new URL("uploads/new", prefix);

    uploadUrl.searchParams.set("url", url);

    if (ref) {
        uploadUrl.searchParams.set("ref", ref);
    }

    return uploadUrl;
}

export async function makeUrl(prefix, batch, info, getReferrer) {
    if (batch) {
        return makeBatchUrl(prefix, info.pageUrl);
    }

    let ref;

    if (info.srcUrl === info.pageUrl) {
        if (info.frameUrl) {
            ref = info.frameUrl;
        } else if (getReferrer) {
            ref = await getReferrer();
        }
    } else {
        ref = info.pageUrl;
    }

    return makePostUrl(prefix, info.srcUrl, ref);
}
