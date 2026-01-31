export const DanbooruURL = "https://danbooru.donmai.us/";

export function getPageActionMatchRegExp(globs) {
    return globs.map((glob) => "^" + glob.replace(/\./g, "\\.").replace(/\*/g, ".*")).join("|");
}

export function getManifest(ctx) {
    return ctx?.chrome?.runtime?.getManifest?.() || ctx?.browser?.runtime?.getManifest?.() || {};
}

export function isChromeManifest(manifest) {
    return !!manifest["minimum_chrome_version"];
}

export function getAPI(ctx) {
    const manifest = getManifest(ctx);

    if (isChromeManifest(manifest)) {
        return [ctx.chrome, true, false];
    }

    return [ctx.browser, false, !ctx.browser?.contextMenus];
}

export function asBool(value, default_) {
    if (value) {
        return /^(yes|true|on|t|y)$/i.test(value);
    }

    return default_ || false;
}
