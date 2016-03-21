/// <reference path="../typings/main/ambient/node/index.d.ts" />
/// <reference path="Folder.ts" />
/// <reference path="WaitLock.ts" />

namespace TSLint.MSBuild {
    "use strict";

    /**
     * A collection of folders, generated from individual file paths.
     */
    export class FolderCollection {
        /**
         * Known folders that have been added.
         */
        private folders: { [i: string]: Folder } = {};

        /**
         * Waiter for loading all tslint.json configurations.
         */
        private loadWaiter: WaitLock = new WaitLock();

        /**
         * @returns The known added folders, in sorted order.
         */
        getFolders(): Folder[] {
            let folderPaths: string[] = Object.keys(this.folders);

            folderPaths.sort();

            return folderPaths.map(folderPath => this.folders[folderPath]);
        }

        /**
         * Adds a file path and its containing folder path.
         * 
         * @param filePath   A path to a file.
         */
        addFilePath(filePath: string): Promise<void> {
            this.loadWaiter.markActionStart();

            return this
                .addFolderPath(this.parseParentPathFromPath(filePath))
                .then(folder => {
                    folder.addFilePath(filePath);
                    this.loadWaiter.markActionCompletion();
                });
        }

        /**
         * Adds a folder path and checks for its tslint.json.
         * 
         * @param folderPath   A path to a folder.
         * @returns A Promise for a representation of that folder.
         */
        addFolderPath(folderPath: string): Promise<Folder> {
            let folder = this.folders[folderPath];

            if (folder) {
                return new Promise(resolve => resolve(folder));
            }

            folder = this.folders[folderPath] = new Folder(folderPath);

            return folder
                .loadTSLintConfig()
                .then(lintConfig => {
                    return this.onFolderLoad(lintConfig, folderPath);
                });
        }

        /**
         * Waits until all tslint.json files have been loaded, then calls the
         * provided callback.
         * 
         * @param callback   A callback for when loading is complete.
         */
        awaitLoading(callback: Function): void {
            this.loadWaiter.addCallback(callback);
        }

        /**
         * Responds to a folder load.
         * 
         * @param lintConfig   The tslint.json settings for the folder, if available. 
         * @param folderPath   The path to the folder.
         * @returns A promise for the folder.
         */
        private onFolderLoad(lintConfig: any, folderPath: string): Promise<Folder> {
            let folder: Folder = this.folders[folderPath],
                completion = resolve => resolve(folder),
                extraWork: () => Promise<any>;

            if (!lintConfig) {
                extraWork = () => this.checkFolderParent(folderPath);
            }

            return new Promise(resolve => {
                if (extraWork) {
                    extraWork().then(() => completion(resolve));
                } else {
                    completion(resolve);
                }
            });
        }

        /**
         * Checks for a folder's parent's tslint.json for a folder that doesn't
         * have its own, recursively adding parent paths.
         * 
         * @param folderPath   A path to a folder that has been loaded.
         * @returns A promise for the parent Folder, if it exists.
         * @todo Check relative to the root solution/package path?
         * @todo Should this reject instead of resolve with undefined?
         */
        private checkFolderParent(folderPath: string): Promise<Folder> {
            if (folderPath.length === 0) {
                return new Promise(resolve => resolve(undefined));
            }

            let folder: Folder = this.folders[folderPath],
                parentPath: string = this.parseParentPathFromPath(folderPath);

            if (parentPath === folderPath) {
                return new Promise(resolve => resolve(undefined));
            }

            return this
                .addFolderPath(parentPath)
                .then(parentFolder => parentFolder.waitForTSLint())
                .then(parentFolder => {
                    let parentTSLintConfig = parentFolder.getTSLintConfig();

                    if (parentTSLintConfig) {
                        folder.setTSLintConfig(parentTSLintConfig);
                    }

                    return parentFolder;
                });
        }

        /**
         * @param folderPath   A path to a folder.
         * @returns The path to the folder's parent.
         * @todo Research if this is possible using the path module.
         */
        private parseParentPathFromPath(folderPath: string): string {
            let lastForwardSlashIndex: number = folderPath.lastIndexOf("/"),
                lastBackSlashIndex: number = folderPath.lastIndexOf("\\"),
                lastSlashIndex: number = Math.max(lastForwardSlashIndex, lastBackSlashIndex),
                parentPath: string = folderPath.substring(0, lastSlashIndex);

            if (!parentPath || parentPath === folderPath) {
                return ".";
            }

            return parentPath;
        }
    }
}
