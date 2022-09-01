import { defaultUrlFixuper } from "./urlFixuper.js";
import { UploadURLGeneratorImpl } from "./uploadUrlGenerator.js";
import { RefererGetterImpl } from "./refererGetter.js";

export const DanbooruURL = "https://danbooru.donmai.us/";

export function fixUrl(url) {
    return defaultUrlFixuper.fix(url);
}

export function makeUploadUrl(prefix, url, ref) {
    const g = new UploadURLGeneratorImpl(prefix);

    return g.generate(url, ref);
}

export function getReferer(info, refererRegex) {
    const r = new RefererGetterImpl(refererRegex);

    return r.fromOnClickData(info);
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

export function asBool(value, default_) {
    if (value) {
        return /^(yes|true|on|t|y)$/i.test(value);
    }

    return default_ || false;
}
