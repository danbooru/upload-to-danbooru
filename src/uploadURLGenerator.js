export class NotImplementedError extends Error {}

export class UploadURLGenerator {
    // eslint-disable-next-line no-unused-vars
    generate(url, ref) {
        throw new NotImplementedError();
    }
}

export class UploadURLGeneratorImpl extends UploadURLGenerator {
    constructor(prefix) {
        super();

        this.prefix = prefix;
    }

    generate(url, ref) {
        const uploadUrl = new URL("uploads/new", this.prefix);

        if (url.startsWith(this.prefix) || ref?.startsWith(this.prefix)) {
            return uploadUrl;
        }

        if (!/^https?:\/\//.test(url)) {
            return uploadUrl;
        }

        uploadUrl.searchParams.set("url", url);

        if (ref) {
            uploadUrl.searchParams.set("ref", ref);
        }

        return uploadUrl;
    }
}
