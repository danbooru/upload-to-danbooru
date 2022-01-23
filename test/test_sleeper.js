import should from "should/as-function.js";

import {
    NotImplementedError,
    Sleeper,
    SetTimeoutSleeper,
} from "upload-to-danbooru/sleeper.js";

describe("Sleeper", function() {
    it("sleep()", async function() {
        const sleeper = new Sleeper();

        should(sleeper.sleep(10)).rejectedWith(NotImplementedError);
    });
});

describe("SetTimeoutSleeper", function() {
    it("sleep()", async function() {
        let timeout;

        function setTimeout(callback, ms) {
            timeout = ms;
            callback();
        }

        const sleeper = new SetTimeoutSleeper(setTimeout);

        await sleeper.sleep(123);

        should(timeout).equal(123);
    });

    it("sleep() default", async function() {
        const sleeper = new SetTimeoutSleeper();

        await sleeper.sleep(10);
    });
});
