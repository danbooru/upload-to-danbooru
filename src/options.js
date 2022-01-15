import {BrowserStorageSettings, FormManager} from "./settings.js";

const api = globalThis.browser || globalThis.chrome;
const form = document.forms.settings;
const settings = new BrowserStorageSettings(api);
const defaults = {url: "", openIn: "new"};
const formManager = new FormManager(form, settings, defaults);

async function saveOptions(e) {
    e.preventDefault();

    await formManager.save("url", "openIn");
}

async function restoreOptions() {
    await formManager.load("url", "openIn");
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.forms.settings.addEventListener("submit", saveOptions);
