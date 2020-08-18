# Upload to Danbooru Web Extension

Add a page action and a context menu option (for images) to upload to ![cardboard box](/danbooru.svg) Danbooru. Replacement for [bookmarklets](https://danbooru.donmai.us/static/bookmarklet).

## Usage

![Page action demo](/screenshots/page-action.png)

![Context menu demo](/screenshots/context-menu.png)

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

* Replace `activeTab` permission with `tabs` in `dist/manifest.json`
* Open Chrome Settings
* Select Extensions
* Enable developer mode
* Click Load Unpacked
* Select `dist/` folder

### web-ext

```sh
npx web-ext run
```
