/// <reference path="../typings/main/ambient/node/index.d.ts" />

namespace TSLint.MSBuild {
    "use strict";

    const fs = require("fs"),
        path = require("path");

    export class ConfigLoader {

        /**
         * Reads and deserializes a tslint.json file.
         * @param path  The path of the file.
         * @returns A promise with the configuration object.
         */
        public readJSONConfig(path: string) {
            return new Promise((resolve, reject) => {
                fs.readFile(path, (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(JSON.parse(ConfigLoader.stripBomIfNeeded(result.toString())));
                    }
                });
            });
        }

        /**
         * Strips BOM if any.
         * @param content   the raw content of a file.
         * @returns The content with the BOM stripped.
         */
        static stripBomIfNeeded(content: string) {
            return content.replace(/^\uFEFF/, "");
        }
    }
}