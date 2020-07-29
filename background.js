const DefaultDanbooruURL = "https://danbooru.donmai.us/";

browser.contextMenus.create({
    id: "upload-to-danbooru",
    title: "Upload to &Danbooru",
    contexts: ["image"],
});

async function getReferrer(tabId) {
    const code = "document.referrer";

    try {
        const results = await browser.tabs.executeScript(tabId, {code});

        return results.find(Boolean) || "";
    } catch (err) {
        console.error("failed to get referrer", err);
    }

    return "";
}

browser.contextMenus.onClicked.addListener(async function(info, tab) {
    if (info.menuItemId !== "upload-to-danbooru") {
        return;
    }

    const settings = await browser.storage.sync.get(["url", "openIn"]);
    const danbooruUrl = settings.url || DefaultDanbooruURL;
    const batch = (info.modifiers || []).some((key) => key === "Ctrl");
    let url, ref, active = true;

    if (batch) {
        url = new URL("uploads/batch", danbooruUrl);

        url.searchParams.set("url", info.pageUrl);
    } else {
        url = new URL("uploads/new", danbooruUrl);

        if (info.srcUrl === info.pageUrl) {
            if (info.frameUrl) {
                ref = info.frameUrl;
            } else {
                ref = await getReferrer(tab.id);
            }
        } else {
            ref = info.pageUrl;
        }

        url.searchParams.set("url", info.srcUrl);
        url.searchParams.set("ref", ref);
    }

    switch (settings.openIn) {
    case "current":
        await browser.tabs.update(tab.id, {url: url.href});
        break;
    case "background":
        active = false;
    default:
        await browser.tabs.create({
            active: active,
            openerTabId: tab.id,
            url: url.href,
        });
    }
});
