#!/bin/sh

set -e
set -v

rm -fr dist/
mkdir dist
cp -t dist/ node_modules/webextension-polyfill/dist/browser-polyfill.js{,.map}
cp -a src/. dist/
npx web-ext build --overwrite-dest
