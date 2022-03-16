import {BrowserStorageSettings, FormManager} from "./settings.js";
import { DanbooruURL, getAPI } from "./utils.js";

const [api, isChrome] = getAPI(globalThis);
const form = document.forms.settings;
const settings = new BrowserStorageSettings(api);
const defaults = {url: "", pageActionOpenIn: "current", contextMenuOpenIn: "background"};
const formManager = new FormManager(form, settings, defaults);

async function saveOptions(e) {
    e.preventDefault();

    await formManager.save("url", "pageActionOpenIn", "contextMenuOpenIn");

    if (isChrome) {
        window.close();
    } else {
        alert("Saved.");
    }
}

async function restoreOptions() {
    await formManager.load("url", "pageActionOpenIn", "contextMenuOpenIn");
}

document.addEventListener("DOMContentLoaded", restoreOptions);
form.addEventListener("submit", saveOptions);
form.url.placeholder = DanbooruURL;
