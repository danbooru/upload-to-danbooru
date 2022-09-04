import { defaultUrlFixuper } from "./urlFixuper.js";

export class NotImplementedError extends Error {}

export class UploadURLService {
    // eslint-disable-next-line no-unused-vars
    fromOnClickData(info) {
        throw new NotImplementedError();
    }

    // eslint-disable-next-line no-unused-vars
    fromTab(tab) {
        throw new NotImplementedError();
    }
}

export class UploadURLServiceImpl extends UploadURLService {
    constructor(uploadUrlGenerator, refererGetter, urlFixuper) {
        super();

        this.uploadUrlGenerator = uploadUrlGenerator;
        this.refererGetter = refererGetter;
        this.urlFixuper = urlFixuper || defaultUrlFixuper;
    }

    fromOnClickData(info) {
        if (info.srcUrl) {
            return this.uploadUrlGenerator.generate(
                this.urlFixuper.fix(info.srcUrl),
                this.refererGetter.fromOnClickData(info),
            );
        }

        if (info.linkUrl) {
            return this.uploadUrlGenerator.generate(info.linkUrl);
        }

        throw Error("info object must contain either srcUrl or linkUrl");
    }

    fromTab(tab) {
        return this.uploadUrlGenerator.generate(tab.url);
    }
}
