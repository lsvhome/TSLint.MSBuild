/// <reference path="../typings/main/ambient/node/index.d.ts" />
/// <reference path="Folder.ts" />

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
         * How many tslint.json loads are currently pending.
         */
        private pendingLoads: number = 0;

        /**
         * Callbacks waiting for pending loads to complete.
         */
        private loadingCallbacks: Function[] = [];

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
        addFilePath(filePath: string): Promise<Folder> {
            return this
                .addFolderPath(this.parseParentPathFromPath(filePath))
                .then(folder => {
                    folder.addFilePath(filePath);
                    return folder;
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

            this.pendingLoads += 1;
            folder = this.folders[folderPath] = new Folder(folderPath);

            return folder
                .loadTSLintConfig()
                .then(lintConfig => this.onFolderLoad(lintConfig, folderPath));
        }

        /**
         * Waits until all tslint.json files have been loaded, then calls the
         * provided callback.
         * 
         * @param callback   A callback for when loading is complete.
         */
        awaitLoading(callback: Function): void {
            this.loadingCallbacks.push(callback);
        }

        /**
         * Responds to a folder load.
         * 
         * @param lintConfig   The tslint.json settingsforthefolder, if available. 
         * @param folderPath   The path to the folder.
         * @returns A promise for the folder.
         */
        private onFolderLoad(lintConfig: any, folderPath: string): Promise<Folder> {
            if (!lintConfig) {
                this.checkFolderParent(folderPath);
            }

            this.pendingLoads -= 1;

            if (this.pendingLoads === 0) {
                this.loadingCallbacks.forEach(loadingCallback => loadingCallback());
                this.loadingCallbacks = [];
            }

            return new Promise(resolve => this.folders[folderPath]);
        }

        /**
         * Checks for a folder's parent's tslint.json for a folder that doesn'that
         * have its own, recursively adding parent paths.
         * 
         * @param folderPath   A path to a folder that has been loaded.
         * @todo Check relative to the root solution/package path.
         */
        private checkFolderParent(folderPath: string): Promise<void> {
            if (folderPath.length < 3) {
                return;
            }

            let folder: Folder = this.folders[folderPath];

            return this
                .addFolderPath(this.parseParentPathFromPath(folderPath))
                .then(parentFolder => folder.setTSLintConfig(folder.getTSLintConfig()));
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

            return parentPath || ".";
        }
    }
}
