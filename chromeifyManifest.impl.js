export function chromeifyManifest(manifest) {
    manifest["manifest_version"] = 3;
    manifest["minimum_chrome_version"] = "97";
    manifest["permissions"] = [
        "declarativeContent",
        "scripting",
        ...manifest["permissions"],
    ];
    manifest["action"] = manifest["page_action"];
    manifest["web_accessible_resources"] = [{
        "resources": manifest["web_accessible_resources"],
        "matches": ["*://*/*"],
    }];
    manifest["background"] = {
        "service_worker": "background.js",
        "type": "module",
    };

    delete manifest["page_action"];
    delete manifest["browser_specific_settings"];
    delete manifest["options_ui"]["browser_style"];

    return manifest;
}

export function parseArgs(args) {
    switch (args.length) {
    case 0:
        return ["-", "-"];
    case 1:
        return [args[0], "-"];
    default:
        return [args[0], args[1]];
    }
}

export function transformStream(instream, outstream) {
    const chunks = [];

    instream.on("data", (data) => chunks.push(data));
    instream.on("end", function() {
        const manifest = chromeifyManifest(JSON.parse(chunks.join("")));

        outstream.write(JSON.stringify(manifest, null, 4));
        outstream.end("\n");
    });
    instream.resume();
}
