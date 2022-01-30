export function regexFixup(matchURLRegex, ...args) {
    return {
        match(url) {
            return matchURLRegex.test(url);
        },
        fix(url) {
            for (let [match, replaceWith] of args) {
                url = url.replace(match, replaceWith);
            }
            return url;
        },
    };
}

export const urlFixups = [
    regexFixup(/\.hdslb\.com\//, [/@.*/, ""]),
    regexFixup(/:\/\/media.discordapp.net\//, [/\?.*/, ""]),
    regexFixup(/\.pinimg\.com\//, [/\/\d+x\//, "/originals/"]),
    regexFixup(/(pixiv|booth)\.pximg\.net\//, [/\/c\/\d+x\d+.*?\//, "/"], [/_base_resized/, ""]),
    regexFixup(/:\/\/c\.fantia.jp\//, [/(\d+)\/.*?_/, "$1/"]),
];

export function fixUrl(url) {
    for (let fixup of urlFixups) {
        if (fixup.match(url)) {
            url = fixup.fix(url);
        }
    }
    return url;
}

export class TabUtils {
    constructor(tab, api) {
        this.tab = tab;
        this.api = api;
    }

    makeUrl(prefix, batch) {
        return (batch ? makeBatchUrl : makePostUrl)(prefix, this.tab.url);
    }

    openPage(url, current, background, nextToCurrent) {
        if (current) {
            return this.api.update(this.tab.id, {url});
        }

        const createProperties = {
            active: !background,
            openerTabId: this.tab.id,
            url: url,
        };

        if (nextToCurrent) {
            createProperties["index"] = this.tab.index + 1;
        }

        return this.api.create(createProperties);
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

export const DataURLsNotSupportedError = new Error("Data URLs are not supported");

export async function makeUrl(prefix, batch, info, getReferrer) {
    if (batch) {
        return makeBatchUrl(prefix, info.pageUrl);
    }

    if (info.srcUrl.startsWith("data:")) {
        throw DataURLsNotSupportedError;
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

    return makePostUrl(prefix, fixUrl(info.srcUrl), ref);
}

export function getPageActionMatchRegExp(globs) {
    return globs.map((glob) => "^" + glob.replace(/\./g, "\\.").replace(/\*/g, ".*")).join("|");
}

export function getAPI(ctx) {
    if (ctx.browser) {
        return [ctx.browser, false, !ctx.browser.contextMenus];
    }

    return [ctx.chrome, true, false];
}
