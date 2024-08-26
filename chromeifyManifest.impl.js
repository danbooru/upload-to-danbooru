import { readFile, writeFile } from "fs/promises";

export function chromeifyManifest(manifest) {
    manifest["minimum_chrome_version"] = "97";
    manifest["action"] = manifest["page_action"];
    manifest["commands"]["_execute_action"] = manifest["commands"]["_execute_page_action"];
    manifest["background"]["service_worker"] = manifest["background"]["scripts"][0];

    delete manifest["page_action"];
    delete manifest["commands"]["_execute_page_action"];
    delete manifest["background"]["scripts"];
    delete manifest["browser_specific_settings"];

    return manifest;
}

export async function chromeifyManifestFile(path) {
    const options = {"encoding": "utf-8"};
    const manifest = chromeifyManifest(JSON.parse(await readFile(path, options)));

    await writeFile(path, JSON.stringify(manifest, null, 4), options);
}
