async function saveOptions(e) {
    e.preventDefault();

    const form = document.forms.settings;

    await browser.storage.sync.set({
        url: form.url.value,
        openIn: form.openIn.value,
    });
}

async function restoreOptions() {
    const form = document.forms.settings;
    const settings = await browser.storage.sync.get(['url', 'openIn']);

    form.url.value = settings.url || "";
    form.openIn.value = settings.openIn || "new";
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.forms.settings.addEventListener("submit", saveOptions);
