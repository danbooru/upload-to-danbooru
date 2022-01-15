export class NotImplementedError extends Error {}

export class Settings {
    // eslint-disable-next-line no-unused-vars
    async get(...keys) {
        throw new NotImplementedError();
    }

    // eslint-disable-next-line no-unused-vars
    async set(mapping) {
        throw new NotImplementedError();
    }
}

export class BrowserStorageSettings extends Settings {
    constructor(browser) {
        super();
        this.browser = browser;
    }

    get(...keys) {
        return this.browser.storage.sync.get(keys);
    }

    set(mapping) {
        return this.browser.storage.sync.set(mapping);
    }
}

export class InMemorySettings extends Settings {
    constructor() {
        super();
        this.storage = {};
    }

    async get(...keys) {
        const out = {};
        for (const key of keys) {
            out[key] = this.storage[key];
        }
        return out;
    }

    async set(mapping) {
        for (const [key, value] of Object.entries(mapping)) {
            this.storage[key] = value;
        }
    }
}

export class FormManager {
    constructor(form, settings, defaults) {
        this.form = form;
        this.settings = settings;
        this.defaults = defaults || {};
    }

    async save(...keys) {
        const settings = {};

        for (const key of keys) {
            settings[key] = this.form[key].value;
        }

        await this.settings.set(settings);
    }

    async load(...keys) {
        const settings = await this.settings.get(...keys);

        for (const key of keys) {
            this.form[key].value = settings[key] || this.defaults[key] || "";
        }
    }
}
