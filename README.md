# Upload to Danbooru Web Extension

Add a context menu option for images to upload to Danbooru.

## Build

```sh
npm install --global web-ext
npm install webextension-polyfill
cp node_modules/webextension-polyfill/dist/browser-polyfill.js .
web-ext build -n upload_to_danbooru.zip -i README.md
```

### Chrome

```sh
npm install --global crx3
test -f key.pem || openssl genrsa -out key.pem 4096
crx3 -p key.pem -o web-ext-artifacts/upload_to_danbooru.crx < web-ext-artifacts/upload_to_danbooru.zip
```

## Install

```sh
firefox web-ext-artifacts/upload_to_danbooru.zip
```

### Chrome

Open `chrome://extensions`, enable `Developer mode`, then drop
`web-ext-artifacts/upload_to_danbooru.crx` onto the page.
