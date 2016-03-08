/**
 * (c) Microsoft
 */
/// <reference path="../typings/main/ambient/node/node.d.ts" />
/// <reference path="Folder.ts" />

"use strict";

namespace LinterTest {
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
        addFilePath(filePath: string): void {
            let folder = this.addFolderPath(this.parseParentPathFromPath(filePath));

            folder.addFilePath(filePath);
        }

        /**
         * Adds a folder path and checks for its tslint.json.
         * 
         * @param folderPath   A path to a folder.
         * @returns A representation of that folder.
         */
        addFolderPath(folderPath: string): Folder {
            let folder = this.folders[folderPath];

            if (!folder) {
                this.pendingLoads += 1;
                (folder = this.folders[folderPath] = new Folder(folderPath))
                    .loadTSLintConfig()
                    .then(lintConfig => this.onFolderLoad(lintConfig, folderPath));
            }

            return folder;
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
         * @param lintConfig   Whether 
         * @param folderPath
         */
        private onFolderLoad(lintConfig: any, folderPath: string): void {
            if (!lintConfig) {
                this.checkFolderParent(folderPath);
            }

            this.pendingLoads -= 1;

            if (this.pendingLoads === 0) {
                this.loadingCallbacks.forEach(loadingCallback => loadingCallback());
                this.loadingCallbacks = [];
            }
        }

        /**
         * Checks for a folder's parent's tslint.json, recursively adding parent paths.
         * 
         * @param folderPath   A path to a folder that has been loaded.
         * @todo Check relative to the root solution/package path.
         * @todo Mark the parent's tslint.json in the child if necessary.
         */
        private checkFolderParent(folderPath: string): void {
            if (folderPath.length < 7) {
                return;
            }

            this.addFolderPath(this.parseParentPathFromPath(folderPath));
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
