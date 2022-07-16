import {
    BrowserContextMenuManager,
    ContextMenuSetupperImpl,
} from "./contextMenuManager.js";
import { BrowserStorageSettings } from "./settings.js";
import { UploadToDanbooru } from "./uploadToDanbooru.js";
import { getAPI } from "./utils.js";
import { AndroidURLOpener, BrowserURLOpener, ChromeURLOpener } from "./urlOpener.js";

const [api, isChrome, isAndroid] = getAPI(globalThis);
const settings = new BrowserStorageSettings(api);
const cm = new BrowserContextMenuManager(api);
const cms = new ContextMenuSetupperImpl(cm, settings);
const urlOpenerClass = isChrome ? ChromeURLOpener : (isAndroid ? AndroidURLOpener : BrowserURLOpener);
const uploadToDanbooru = new UploadToDanbooru(
    api,
    isChrome,
    settings,
    cms,
    urlOpenerClass,
);

uploadToDanbooru.init();
