/// <reference path="../typings/main/ambient/node/index.d.ts" />

namespace TSLint.MSBuild.ConfigLoader {
    "use strict";

    const fs = require("fs"),
        path = require("path");

    /**
     * Reads and deserializes a tslint.json file.
     * @param path  The path of the file.
     * @returns A promise with the configuration object.
     */
    export function readJSONConfig(path: string) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(JSON.parse(stripBomIfNeeded(result.toString())));
                }
            });
        });
    }

    /**
     * Strips BOM if any.
     * @param content   the raw content of a file.
     * @returns The content with the BOM stripped.
     */
    function stripBomIfNeeded(content: string) {
        return content.replace(/^\uFEFF/, "");
    }
}