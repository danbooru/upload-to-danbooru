import {
    BrowserContextMenuManager,
    ContextMenuSetupperImpl,
} from "./contextMenuManager.js";
import { BrowserStorageSettings } from "./settings.js";
import { UploadToDanbooru } from "./uploadToDanbooru.js";
import { getAPI } from "./utils.js";
import { AndroidURLOpener, BrowserURLOpener, ChromeURLOpener } from "./urlOpener.js";
import { RefererGetterImpl } from "./refererGetter.js";
import { UploadURLGeneratorImpl } from "./uploadURLGenerator.js";
import { UploadURLServiceImpl } from "./uploadURLService.js";

const [api, isChrome, isAndroid] = getAPI(globalThis);
const settings = new BrowserStorageSettings(api);
const cm = new BrowserContextMenuManager(api);
const cms = new ContextMenuSetupperImpl(cm, settings);
const urlOpenerClass = isChrome ? ChromeURLOpener : (isAndroid ? AndroidURLOpener : BrowserURLOpener);

function uploadURLServiceFactory(danbooruUrl, pageActionRegex) {
    return new UploadURLServiceImpl(
        new UploadURLGeneratorImpl(danbooruUrl),
        new RefererGetterImpl(pageActionRegex),
    );
}

const uploadToDanbooru = new UploadToDanbooru(
    api,
    isChrome,
    settings,
    cms,
    uploadURLServiceFactory,
    urlOpenerClass,
);

uploadToDanbooru.init();
