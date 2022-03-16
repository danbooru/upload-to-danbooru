import {BrowserStorageSettings, FormManager} from "./settings.js";
import { DanbooruURL, getAPI } from "./utils.js";

const [api, isChrome] = getAPI(globalThis);
const form = document.forms.settings;
const settings = new BrowserStorageSettings(api);
const defaults = {url: "", openIn: "new"};
const formManager = new FormManager(form, settings, defaults);

async function saveOptions(e) {
    e.preventDefault();

    await formManager.save("url", "openIn");

    if (isChrome) {
        window.close();
    } else {
        alert("Saved.");
    }
}

async function restoreOptions() {
    await formManager.load("url", "openIn");
}

document.addEventListener("DOMContentLoaded", restoreOptions);
form.addEventListener("submit", saveOptions);
form.url.placeholder = DanbooruURL;
