# Upload to Danbooru Web Extension

Add a context menu option for images to upload to Danbooru.

## Build

```sh
npm install --global web-ext
npm install webextension-polyfill
cp node_modules/webextension-polyfill/dist/browser-polyfill.js .
web-ext build -n upload_to_danbooru.zip -i README.md
```

## Install

```sh
firefox web-ext-artifacts/upload_to_danbooru.zip
```
