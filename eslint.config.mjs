import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    {
        ignores: ["**/browser-polyfill.js", "**/dist/"],
    },
    ...compat.extends("eslint:recommended"),
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.mocha,
                ...globals.webextensions,
            },

            ecmaVersion: 11,
            sourceType: "module",
        },

        rules: {
            indent: ["error", 4],
            "linebreak-style": ["error", "unix"],
            quotes: ["error", "double"],
            semi: ["error", "always"],
        },
    },
    {
        files: ["chromeifyManifest.js", "chromeifyManifest.impl.js"],
        languageOptions: {
            globals: {
                ...globals.mocha,
                ...globals.node,
            },
            ecmaVersion: 11,
            sourceType: "module",
        },
    },
];
