#!/bin/sh

set -e
set -v

rm -fr dist/
mkdir dist
cp -a src/. dist/

if [ x$CHROME = xyes ]; then
    ./chromeifyManifest.js src/manifest.json > dist/manifest.json
    rm dist/background.html

    FILENAME="{name}-{version}-chrome.zip"
else
    FILENAME="{name}-{version}.zip"
fi

npx web-ext build --overwrite-dest --filename "$FILENAME"
