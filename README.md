# Upload to Danbooru Web Extension

Add a page action and a context menu option (for images) to upload to ![cardboard box](/danbooru.svg) Danbooru. Replacement for [bookmarklets](https://danbooru.donmai.us/static/bookmarklet).

## Usage

### Page Action

![Page action demo](/screenshots/page-action.png)

Just visit any Danbooru-supported page, then click ![cardboard box](/danbooru.svg) icon in the address bar.

### Context Menu

![Context menu demo](/screenshots/context-menu.png)

Right click on any image, select "Upload to Danbooru". Holding <kbd>Ctrl</kbd> while clicking will trigger batch upload.

## Build

```sh
npm i
npm run build
```

Extension package will be located in `web-ext-artifacts/` folder.

## Run Tests

```sh
npm test
```

## Install In Developer Mode

Make sure you have built extension.

### Firefox

* Open `about:debugging`
* Click `Load Temporary Add-on`
* Select `dist/manifest.json` file

### Chrome

* Open Chrome Settings
* Select Extensions
* Enable developer mode
* Click Load Unpacked
* Select `dist/` folder

### web-ext

```sh
npx web-ext run
```
