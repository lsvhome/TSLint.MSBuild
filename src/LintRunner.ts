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
    let fs = require("fs"),
        TSLinter = require("tslint");

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
                let folders: Folder[] = this.folders.getFolders(),
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
            return new Promise<string[]>(resolve => {
                let lintConfig: ITSLintConfig = folder.getTSLintConfig(),
                    filePaths: string[] = folder.getFilePaths(),
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
                        let linter = new TSLinter(filePath, result.toString(), lintConfig),
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
