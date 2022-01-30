# Upload to Danbooru Web Extension

Add a page action and a context menu option (for images) to upload to ![cardboard box](/danbooru.svg) Danbooru. Replacement for [bookmarklets](https://danbooru.donmai.us/static/bookmarklet).

## Install

* [Firefox](https://addons.mozilla.org/en-US/firefox/addon/upload-to-danbooru/)
* [Chrome](https://chrome.google.com/webstore/detail/upload-to-danbooru/faoifiojjmdkjpgkjpikkjdfocdjjpla)

## Usage

### Page Action

![Page action demo](/screenshots/page-action.png)

Just visit any Danbooru-supported page, then click ![cardboard box](/danbooru.svg) icon in the address bar.

### Context Menu

![Context menu demo](/screenshots/context-menu.png)

Right click on any image, select "Upload to Danbooru".

## Build

```sh
npm i
npm run build       # Firefox
npm run buildChrome # Chrome
```

Extension package will be located in `web-ext-artifacts/` folder.

## Run Tests

```sh
npm test
```

## Install In Developer Mode

### Firefox

* Open `about:debugging#/runtime/this-firefox`
* Click `Load Temporary Add-on`
* Select `src/manifest.json` file

### Chrome

Make sure you have built extension.

* Open Chrome Settings
* Select Extensions
* Enable developer mode
* Click Load Unpacked
* Select `dist/` folder

### web-ext

Firefox (sandbox):

```sh
npx web-ext run
```

[Android](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/#testing-in-firefox-for-android):

```sh
npx web-ext run --firefox-apk org.mozilla.fenix --target=firefox-android --android-device=DEVICE_ID
```

Replace `DEVICE_ID` with id of the device from `adb devices`.
