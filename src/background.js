import { BrowserStorageSettings } from "./settings.js";
import { UploadToDanbooru } from "./uploadToDanbooru.js";
import { getAPI } from "./utils.js";
import { TabMessagingProtocol, getTabMessenger } from "./messaging.js";

const [api, isChrome] = getAPI(globalThis);
const settings = new BrowserStorageSettings(api);
const tabMessenger = getTabMessenger(api, isChrome);
const tabMessagingProtocol = new TabMessagingProtocol(tabMessenger);
const uploadToDanbooru = new UploadToDanbooru(
    api,
    isChrome,
    settings,
    tabMessagingProtocol,
);

uploadToDanbooru.init();
