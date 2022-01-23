export class NotImplementedError extends Error {}

export class Sleeper {
    // eslint-disable-next-line no-unused-vars
    async sleep(ms) {
        throw new NotImplementedError();
    }
}

export class SetTimeoutSleeper extends Sleeper {
    constructor(setTimeout) {
        super();

        this.setTimeout = setTimeout || globalThis.setTimeout.bind(globalThis);
    }

    sleep(ms) {
        return new Promise(resolve => this.setTimeout(resolve, ms));
    }
}
