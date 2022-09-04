export const DanbooruURL = "https://danbooru.donmai.us/";

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
