/// <reference path="../typings/main/ambient/node/index.d.ts" />
/// <reference path="Folder.ts" />
/// <reference path="FolderCollection.ts" />

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
         * The root directory to look at files under.
         */
        private rootDirectory: string;

        /**
         * Folders generated from individual file paths.
         */
        private folders: FolderCollection;

        /**
         * Initializes a new instance of the LintRunner class.
         * 
         * @param rootDirectory   The root directory to look at files under.
         */
        constructor(rootDirectory: string) {
            this.rootDirectory = rootDirectory;
            this.folders = new FolderCollection(rootDirectory);
        }

        /**
         * Adds a list of file paths to the folder collection.
         * 
         * @param filePaths   File paths to add to the folder collection.
         * @returns A promise of the folder's files loading their tslint.jsons.
         */
        public addFilePaths(filePaths: string[]): Promise<any> {
            return this.folders.addFilePaths(
                filePaths.map((filePath: string): string => fs.realpathSync(filePath)));
        }

        /**
         * Runs TSLint on the added file paths.
         * 
         * @returns A promise for TSLint errors, in alphabetic order of file path.
         */
        public runTSLint(): Promise<string[]> {
            let folders: Folder[] = this.folders.getFolders(),
                lintPromises = folders
                    .map(folder => {
                        try {
                            return this.lintFolder(folder);
                        } catch (error) {
                            return this.promiseFailure("folder", folder.getPath(), error);
                        }
                    });

            return Promise.all(lintPromises).then(errors => [].concat.apply([], errors));
        }

        /**
         * Runs TSLint on a folder's files.
         * 
         * @param folder   A folder whose files should be linted.
         * @returns A promise for TSLint errors, in alphabetic order of file path.
         */
        private lintFolder(folder: Folder): Promise<string[]> {
            let lintConfig: any = folder.getTSLintConfig();

            if (!lintConfig) {
                throw new Error(`No tslint.json available for '${folder.getPath()}'`);
            }

            let filePaths: string[] = folder.getFilePaths(),
                filePromises: Promise<string[]>[] = filePaths
                    .map(filePath => {
                        try {
                            return this.lintFile(filePath, lintConfig);
                        } catch (error) {
                            return this.promiseFailure("file", filePath, error);
                        }
                    });

            return Promise.all(filePromises).then(errors => [].concat.apply([], errors));
        }

        /**
         * Runs TSLint on a file.
         * 
         * @param filePath   The path to the file.
         * @param lintConfig   TSLint settings from a tslint.json.
         * @returns A promise for TSLint errors, in alphabetic order of file path.
         */
        private lintFile(filePath: string, lintConfig: any): Promise<string[]> {
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

        /**
         * Reports a failure message to a parent Promise chain.
         * 
         * @param type   The type of item that failed.
         * @param path   The path to the failed item.
         * @param error   The thrown error.
         * @returns A Promise for a failure message.
         */
        private promiseFailure(type: "file" | "folder", path: string, error: Error): Promise<string[]> {
            return new Promise(resolve => {
                resolve([`Failed linting ${type} '${path}': '${error.message}'`]);
            });
        }
    }
}
