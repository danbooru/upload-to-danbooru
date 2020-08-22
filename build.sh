#!/bin/sh

set -e
set -v

rm -fr dist/
mkdir dist
cp -t dist/ node_modules/webextension-polyfill/dist/browser-polyfill.js{,.map}
cp -a src/. dist/

if [ x$CHROME = xyes ]; then
    ./chromeifyManifest.js src/manifest.json > dist/manifest.json

    FILENAME="{name}-{version}-chrome.zip"
else
    FILENAME="{name}-{version}.zip"
fi

npx web-ext build --overwrite-dest --filename "$FILENAME"
