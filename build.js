#!/usr/bin/env node

import { argv, env } from "node:process";
import { cp, mkdir, rm } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { chromeifyManifestFile } from "./chromeifyManifest.impl.js";
import webExt from "web-ext";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __main = argv[1] === __filename;
const distDir = join(__dirname, "dist");
const distManifest = join(distDir, "manifest.json");
const srcDir = join(__dirname, "src");
const chrome = argv.includes("--chrome") || /yes|true|1/i.test(env.CHROME || "");

async function main() {
    await rm(distDir, {recursive: true, force: true});
    await mkdir(distDir);
    await cp(srcDir, distDir, {recursive: true});

    let filename;

    if (chrome) {
        await chromeifyManifestFile(distManifest);
        filename = "{name}-{version}-chrome.zip";
    } else {
        filename = "{name}-{version}.zip";
    }

    await webExt.cmd.build({
        artifactsDir: "web-ext-artifacts",
        sourceDir: distDir,
        overwriteDest: true,
        filename: filename,
    });
}

if (__main) {
    main().catch(console.error);
}
