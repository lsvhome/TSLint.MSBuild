/// <reference path="../typings/main/ambient/node/index.d.ts" />

const fs = require("fs");
const path = require("path");

import { WaitLock } from "./WaitLock";

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
    public getPath(): string {
        return this.path;
    }

    /**
     * @returns Files registered under this folder.
     */
    public getFilePaths(): string[] {
        return this.filePaths;
    }

    /**
     * @returns TSLint configuration for this folder, if it exists.
     */
    public getTSLintConfig(): any {
        return this.tsLintConfig;
    }

    /**
     * Sets the TSLint configuration for this folder.
     * 
     * @param tsconfig   A new TSLint configuration for this folder.
     */
    public setTSLintConfig(tsconfig: any): any {
        this.tsLintConfig = tsconfig;
        this.loadWaiter.markActionCompletion();
    }

    /**
     * Adds a file path to the list of file paths.
     * 
     * @param filePath   A path to a TypeScript file.
     */
    public addFilePath(filePath: string): void {
        this.filePaths.push(filePath);
    }

    /**
     * Loads a tslint.json from this folder.
     * 
     * @returns A Promise for whether a tslint.json was found.
     */
    public loadTSLintConfig(): Promise<boolean> {
        this.loadWaiter.markActionStart();

        return new Promise(resolve => {
            fs.readFile(path.join(this.path, "tslint.json"), (error, result) => {
                if (error) {
                    this.setTSLintConfig(undefined);
                    resolve(false);
                    return;
                }

                this.setTSLintConfig({
                    formatter: "json",
                    configuration: this.sanitizeFileContents(result)
                });
                resolve(true);
            });
        });
    }

    /**
     * Waits for this folder to load its tsconfig.json.
     * 
     * @returns A Promise for this folder to load its tsconfig.json.
     */
    public waitForTSLint(): Promise<Folder> {
        return new Promise(resolve => {
            return this.loadWaiter.addCallback(() => resolve(this));
        });
    }

    /**
     * Sanitizes a file's contents in case of an odd BOM.
     * 
     * @param raw   Raw contents of a file.
     * @returns The BOM-sanitized equivalent text.
     */
    private sanitizeFileContents(raw: any): string {
        return JSON.parse(raw.toString().replace(/^\uFEFF/, ""));
    }
}
