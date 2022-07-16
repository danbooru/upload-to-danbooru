import {
    BrowserContextMenuManager,
    ContextMenuSetupperImpl,
} from "./contextMenuManager.js";
import {BrowserStorageSettings, FormManager} from "./settings.js";
import { DanbooruURL, getAPI } from "./utils.js";

const [api, isChrome] = getAPI(globalThis);
const form = document.forms.settings;
const settings = new BrowserStorageSettings(api);
const cm = new BrowserContextMenuManager(api);
const cms = new ContextMenuSetupperImpl(cm, settings);
const defaults = {
    url: "",
    pageActionOpenIn: "current",
    contextMenuOpenIn: "background",
    contextMenuEnabled: "yes",
};
const formManager = new FormManager(form, settings, defaults);

async function saveOptions(e) {
    e.preventDefault();

    await formManager.save("url", "pageActionOpenIn", "contextMenuOpenIn", "contextMenuEnabled");

    cms.setup();

    if (isChrome) {
        window.close();
    } else {
        alert("Saved.");
    }
}

async function restoreOptions() {
    await formManager.load("url", "pageActionOpenIn", "contextMenuOpenIn", "contextMenuEnabled");
}

document.addEventListener("DOMContentLoaded", restoreOptions);
form.addEventListener("submit", saveOptions);
form.url.placeholder = DanbooruURL;
