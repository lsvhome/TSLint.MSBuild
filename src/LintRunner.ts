/// <reference path="../typings/main/ambient/node/node.d.ts" />
/// <reference path="Folder.ts" />
/// <reference path="FolderCollection.ts" />

/**
 * @todo Get tslint definitions
 */
declare type ITSLintConfig = any;

namespace TSLint.MSBuild {
    "use strict";

    /**
     * The default path prefix to require TSLint under.
     */
    const tsLintPathPrefixDefault: string = "../../../packages";

    /**
     * The ending of the path to require TSLint under.
     */
    const tsLintPathSuffix: string = "tslint.3.5.2/tools/node_modules/tslint";

    /**
     * The path to require for TSLint under.
     */
    const tsLintPath: string = ((): string => {
        let path = require("path"),
            nugetLocation: string = process.env.NugetMachineInstallRoot;

        return path.join(nugetLocation || tsLintPathPrefixDefault, tsLintPathSuffix);
    })();

    let fs = require("fs"),
        TSLint = require(tsLintPath);

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
            filePaths.forEach(filePath => this.folders.addFilePath(filePath));

            return new Promise<void>(resolve => this.folders.awaitLoading(resolve));
        }

        /**
         * Runs TSLint on the added file paths.
         * 
         * @returns A promise for TSLint errors, in alphabetic order of file path.
         */
        runTSLint(): Promise<string[]> {
            let folders: Folder[] = this.folders.getFolders(),
                lintPromises = folders
                    .map(folder => this.lintFolder(folder))
                    .filter(promise => !!promise);

            return new Promise<string[]>(resolve => {
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
            let lintConfig: ITSLintConfig = folder.getTSLintConfig();

            if (!lintConfig) {
                console.error(`No tslint.config available for '${folder.getPath()}'`);
                return undefined;
            }

            let filePaths: string[] = folder.getFilePaths(),
                filePromises: Promise<string[]>[] = filePaths.map(
                    filePath => this.lintFile(filePath, lintConfig));

            return new Promise<string[]>(resolve => {
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
            return new Promise(resolve => {
                fs.readFile(filePath, (error, result) => {
                    if (error) {
                        resolve([`Failure reading '${filePath}': ${error.toString()}`]);
                        return;
                    }

                    try {
                        let linter = new TSLint(filePath, result.toString(), lintConfig),
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
