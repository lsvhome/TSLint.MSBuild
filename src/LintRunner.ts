/**
 * (c) Microsoft
 */
/// <reference path="../typings/main/ambient/node/node.d.ts" />
/// <reference path="Folder.ts" />
/// <reference path="FolderCollection.ts" />

"use strict";

/**
 * @todo Get tslint definitions
 */
declare type ITSLintConfig = any;

namespace LinterTest {
    var fs = require("fs"),
        tslint = require("../../../packages/tslint.3.5.2/tools/node_modules/tslint");

    /**
     * Driver for running TSLint on a number of files.
     */
    export class LintRunner {
        /**
         * Folders generated from individual file paths.
         */
        private folders: FolderCollection = new FolderCollection();

        /**
         * Adds a list of file paths to the folder collection.
         * 
         * @param filePaths   File paths to add to the folder collection.
         * @returns A promise of the folder collection waiting until all folders
         *          have determined their tslint.configs.
         */
        addFilePaths(filePaths: string[]): Promise<void> {
            return new Promise<void>(fulfill => {
                filePaths.forEach(filePath => this.folders.addFilePath(filePath));
                this.folders.awaitLoading(fulfill);
            });
        }

        /**
         * Runs TSLint on the added file paths.
         * 
         * @returns A promise for TSLint errors, in alphabetic order of file path.
         */
        runTSLint(): Promise<string[]> {
            return new Promise<string[]>(resolve => {
                var folders: Folder[] = this.folders.getFolders(),
                    lintPromises = folders.map(folder => this.lintFolder(folder));

                Promise.all(lintPromises).then(errors => {
                    resolve([].concat.apply([], errors));
                });
            });
        }

        /**
         * Runs TSLint on a folder's files.
         * 
         * @param folder   A folder whose files should be linted.
         * @returns A promise for TSLint errors, in alphabetic order of file path.
         */
        private lintFolder(folder: Folder): Promise<string[]> {
            var lintConfig: ITSLintConfig = folder.getTSLintConfig();

            if (!lintConfig) {
                throw new Error(`No tslint.config available for '${folder.getPath()}'`);
            }

            return new Promise<string[]>(resolve => {
                var filePaths: string[] = folder.getFilePaths(),
                    filePromises: Promise<string[]>[] = filePaths.map(
                        filePath => this.lintFile(filePath, lintConfig));

                Promise.all(filePromises).then(errors => {
                    resolve([].concat.apply([], errors));
                });
            });
        }

        /**
         * Runs TSLint on a file.
         * 
         * @param filePath   The path to the file.
         * @param lintConfig   TSLint settings from a tslint.json.
         * @returns A promise for TSLint errors, in alphabetic order of file path.
         */
        private lintFile(filePath: string, lintConfig: ITSLintConfig): Promise<string[]> {
            return new Promise((resolve, reject) => {
                fs.readFile(filePath, (error, result) => {
                    if (error) {
                        resolve([`Failure reading '${filePath}': ${error.toString()}`]);
                        return;
                    }

                    try {
                        var linter = new tslint(filePath, result.toString(), lintConfig),
                            errorSummary = linter.lint();

                        resolve(JSON.parse(errorSummary.output));
                    } catch (error) {
                        resolve([`Failed linting '${filePath}': ${error.toString()}`]);
                    }
                });
            });
        }
    }
}
