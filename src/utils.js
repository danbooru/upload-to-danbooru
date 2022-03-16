export const DanbooruURL = "https://danbooru.donmai.us/";

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

export function makeUploadUrl(prefix, url, ref) {
    const uploadUrl = new URL("uploads/new", prefix);

    uploadUrl.searchParams.set("url", url);

    if (ref) {
        uploadUrl.searchParams.set("ref", ref);
    }

    return uploadUrl;
}

export function getReferer(info, refererRegex) {
    if (info.srcUrl === info.pageUrl) {
        return info.frameUrl ? info.frameUrl : info.srcUrl;
    }

    if (info.linkUrl && refererRegex && refererRegex.test(info.linkUrl)) {
        return info.linkUrl;
    }

    return info.pageUrl;
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
