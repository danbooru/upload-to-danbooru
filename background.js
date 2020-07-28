const DefaultDanbooruURL = "https://danbooru.donmai.us/";

browser.contextMenus.create({
    id: "upload-to-danbooru",
    title: "Upload to Danbooru",
    contexts: ["image"],
});

browser.contextMenus.onClicked.addListener(async function(info, tab) {
    if (info.menuItemId !== "upload-to-danbooru") {
        return;
    }

    const settings = await browser.storage.sync.get(['url', 'openIn']);
    const danbooruUrl = settings.url || DefaultDanbooruURL;
    const batch = (info.modifiers || []).some((key) => key === "Ctrl");
    let url, active = true;

    if (batch) {
        url = new URL("uploads/batch", danbooruUrl);

        url.searchParams.set("url", info.pageUrl);
    } else {
        url = new URL("uploads/new", danbooruUrl);

        url.searchParams.set("url", info.srcUrl);
        url.searchParams.set("ref", info.pageUrl);
    }

    switch (settings.openIn) {
    case "current":
        await browser.tabs.update(tab.id, {url: url.href});
        break;
    case "background":
        active = false
    default:
        await browser.tabs.create({
            active: active,
            openerTabId: tab.id,
            url: url.href,
        })
    }
});
