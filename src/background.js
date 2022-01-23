import { BrowserStorageSettings } from "./settings.js";
import { UploadToDanbooru } from "./uploadToDanbooru.js";
import { getAPI } from "./utils.js";
import { BrowserTabMessenger, ChromeTabMessenger, TabMessagingProtocol } from "./messaging.js";
import {
    BatchDetectorInjector,
    BrowserContentScriptInjector,
    ChromeContentScriptInjector,
} from "./contentScriptInjector.js";
import { SetTimeoutSleeper } from "./sleeper.js";

const [api, isChrome] = getAPI(globalThis);
const settings = new BrowserStorageSettings(api);
const sleeper = new SetTimeoutSleeper();
let tabMessenger, contentScriptInjector;

if (isChrome) {
    tabMessenger = new ChromeTabMessenger(api);
    contentScriptInjector = new ChromeContentScriptInjector(api);
} else {
    tabMessenger = new BrowserTabMessenger(api);
    contentScriptInjector = new BrowserContentScriptInjector(api);
}

const tabMessagingProtocol = new TabMessagingProtocol(tabMessenger);
const batchDetectorInjector = new BatchDetectorInjector(
    "contentScripts/uploadToDanbooru.js",
    contentScriptInjector,
    tabMessagingProtocol,
    sleeper,
);
const uploadToDanbooru = new UploadToDanbooru(
    api,
    isChrome,
    settings,
    tabMessagingProtocol,
    batchDetectorInjector,
);

uploadToDanbooru.init();
