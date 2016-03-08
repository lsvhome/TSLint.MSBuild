/**
 * (c) Microsoft
 */
/// <reference path="../typings/main/ambient/node/node.d.ts" />

"use strict";

/**
 * @todo Get tslint definitions.
 */
declare type ITSConfig = any;

namespace LinterTest {
    let fs = require("fs"),
        path = require("path");

    /**
     * A representation of a directory with files and optionally a tsconfig.json.
     */
    export class Folder {
        /**
         * This folder's path.
         */
        private path: string;

        /**
         * Files registered under this folder.
         */
        private filePaths: string[] = [];

        /**
         * TSLint configuration for this folder, if it exists.
         */
        private tsconfig: ITSConfig;

        /**
         * Initializes a new instance of the Folder class.
         * 
         * @param path   The path to this folder.
         */
        constructor(path: string) {
            this.path = path;
        }

        /**
         * @returns Files registered under this folder.
         */
        getFilePaths(): string[] {
            return this.filePaths;
        }

        /**
         * @returns TSLint configuration for this folder, if it exists.
         */
        getTSLintConfig(): ITSConfig {
            return this.tsconfig;
        }

        /**
         * Sets the TSLint configuration for this folder.
         * 
         * @param tsconfig   A new TSLint configuration for this folder.
         */
        setTsconfig(tsconfig: ITSConfig): any {
            this.tsconfig = tsconfig;
        }

        /**
         * Adds a file path to the list of file paths.
         * 
         * @param filePath   A path to a TypeScript file.
         */
        addFilePath(filePath: string): void {
            this.filePaths.push(filePath);
        }

        /**
         * Loads a tsconfig.json from this folder.
         * 
         * @returns A Promise for whether a tsconfig.json was found.
         */
        loadTSLintConfig(): Promise<ITSConfig> {
            return new Promise((resolve) => {
                fs.readFile(path.join(this.path, "tslint.json"), (error, result) => {
                    if (error) {
                        resolve(false);
                        return;
                    }

                    this.tsconfig = {
                        formatter: "json",
                        configuration: JSON.parse(result.toString())
                    };

                    resolve(true);
                });
            });
        }
    }
}
