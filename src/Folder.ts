/// <reference path="../typings/main/ambient/node/index.d.ts" />

namespace TSLint.MSBuild {
    "use strict";

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
        private tsLintConfig: any;

        /**
         * Waiter for loading the tslint.json configuration. 
         */
        private loadWaiter: WaitLock = new WaitLock();

        /**
         * Initializes a new instance of the Folder class.
         * 
         * @param path   The path to this folder.
         */
        constructor(path: string) {
            this.path = path;
        }

        /**
         * @returns The path to this folder.
         */
        getPath(): string {
           return this.path;
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
        getTSLintConfig(): any {
            return this.tsLintConfig;
        }

        /**
         * Sets the TSLint configuration for this folder.
         * 
         * @param tsconfig   A new TSLint configuration for this folder.
         */
        setTSLintConfig(tsconfig: any): any {
            this.tsLintConfig = tsconfig;
            this.loadWaiter.markActionCompletion();
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
         * Loads a tslint.json from this folder.
         * 
         * @returns A Promise for whether a tslint.json was found.
         */
        loadTSLintConfig(): Promise<boolean> {
            this.loadWaiter.markActionStart();

            return new Promise(resolve => {
                fs.readFile(path.join(this.path, "tslint.json"), (error, result) => {
                    if (error) {
                        resolve(false);
                        return;
                    }

                    this.tsLintConfig = {
                        formatter: "json",
                        configuration: JSON.parse(result.toString())
                    };

                    resolve(true);
                });
            });
        }

        /**
         * Waits for this folder to load its tsconfig.json.
         * 
         * @returns A Promise for this folder to load its tsconfig.json.
         */
        waitForTSLint(): Promise<Folder> {
            return new Promise(resolve => {
                return this.loadWaiter.addCallback(() => resolve(this));
            });
        }
    }
}
