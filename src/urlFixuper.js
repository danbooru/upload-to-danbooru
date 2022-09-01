export class NotImplementedError extends Error {}

export class URLFixuper {
    // eslint-disable-next-line no-unused-vars
    fix(url) {
        throw new NotImplementedError();
    }
}

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

export const defaultUrlFixups = [
    regexFixup(/\.hdslb\.com\//, [/@.*/, ""]),
    regexFixup(/:\/\/media.discordapp.net\//, [/\?.*/, ""]),
    regexFixup(/\.pinimg\.com\//, [/\/\d+x\//, "/originals/"]),
    regexFixup(/(pixiv|booth)\.pximg\.net\//, [/\/c\/\d+x\d+.*?\//, "/"], [/_base_resized/, ""]),
    regexFixup(/:\/\/c\.fantia.jp\//, [/(\d+)\/.*?_/, "$1/"]),
    regexFixup(/.*\.imgix.net\//, [/\?(?!.*s=).*/, ""]),
];

export class URLFixuperImpl extends URLFixuper {
    constructor(urlFixups) {
        super();

        this.urlFixups = urlFixups || defaultUrlFixups;
    }

    fix(url) {
        for (let fixup of this.urlFixups) {
            if (fixup.match(url)) {
                url = fixup.fix(url);
            }
        }

        return url;
    }
}

export const defaultUrlFixuper = new URLFixuperImpl();
