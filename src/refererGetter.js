export class NotImplementedError extends Error {}

export class RefererGetter {
    // eslint-disable-next-line no-unused-vars
    onClickData(info) {
        throw new NotImplementedError();
    }
}

export class RefererGetterImpl extends RefererGetter {
    constructor(refererRegex) {
        super();

        this.refererRegex = refererRegex;
    }

    fromOnClickData(info) {
        if (info.srcUrl === info.pageUrl) {
            return info.frameUrl ? info.frameUrl : info.srcUrl;
        }

        if (info.linkUrl && this.refererRegex.test(info.linkUrl)) {
            return info.linkUrl;
        }

        return info.pageUrl;
    }
}
