/// <reference path="../typings/main/ambient/node/index.d.ts" />

namespace TSLint.MSBuild {
    "use strict";

    /**
     * The folder name NuGet packages are stored under.
     */
    const packagesFolderName: string = "packages";

    /**
     * Where the node module is stored under its NuGet package.
     */
    const pathSuffix: string = "tools/node_modules/tslint";

    let fs = require("fs"),
        path = require("path");

    /**
     * A utility to find a TSLint NuGet package.
     */
    export class TSLintSearcher {
        /**
         * The parent project's NuGet packages folder.
         */
        private packagesDirectory: string;

        /**
         * The highest available version of the TSLint NuGet package.
         */
        private tsLintPackage: string;

        /**
         * Initializes a new instance of the TSLintSearcher class.
         */
        constructor() {
            this.resolvePackagesDirectory();
            this.resolveTSLintPackageDirectory();
        }

        /**
         * @returns The complete path to the TSLint package.
         */
        public resolve(): string {
            let result: string = path.resolve(
                this.packagesDirectory,
                this.tsLintPackage,
                pathSuffix);

            console.log(`Resolved TSLint package to '${result}'.`);

            return result;
        }

        /**
         * Determines the parent project's NuGet packages folder.
         */
        private resolvePackagesDirectory(): void {
            console.log("Resolving packages directory...");

            let currentPath = path.resolve(__dirname, "../..");

            while (true) {
                if (currentPath.length < 1) {
                    throw new Error("Could not find packages directory.");
                }

                console.log(`\tChecking '${currentPath}'...`);

                let childNames: string[] = fs.readdirSync(currentPath);
                if (childNames.indexOf(packagesFolderName) !== -1) {
                    currentPath = path.resolve(currentPath, packagesFolderName);
                    break;
                }

                currentPath = path.resolve(currentPath, "..");
            }

            this.packagesDirectory = currentPath;
            console.log(`Resolved to '${this.packagesDirectory}'.`);
        }

        /**
         * Determines highest version of the TSLint NuGet package.
         */
        private resolveTSLintPackageDirectory(): void {
            console.log("Resolving TSLint package directory...");

            let lintVersions: number[][] = fs.readdirSync(this.packagesDirectory)
                .filter(folderName => /tslint.\b\d+.\d+.\d+\b/.test(folderName))
                .map(folderName => this.parseTSLintPackageVersionFromName(folderName));

            if (lintVersions.length === 0) {
                throw new Error("Couldn't find a TSLint package.");
            }

            lintVersions.sort(TSLintSearcher.versionSorter);
            console.log(`\tFound TSLint versions [${this.joinLintVersions(lintVersions)}].`);

            this.tsLintPackage = `tslint.${lintVersions[0].join(".")}`;
            console.log(`Resolved to '${this.tsLintPackage}'.`);
        }

        /**
         * @param folderName   The name of a TSLint folder.
         * @returns The semver associated with that name.
         */
        private parseTSLintPackageVersionFromName(folderName: string): number[] {
            return folderName
                .replace("tslint", "")
                .split(".")
                .filter(numberRaw => !!numberRaw)
                .map(numberRaw => parseInt(numberRaw));
        }

        /**
         * @param lintVersions   Found versions of a package.
         * @returns A human-readable list of the given versions.
         */
        private joinLintVersions(lintVersions: number[][]): string {
            return lintVersions.map(lintVersion => lintVersion.join(".")).join(",");
        }

        /**
         * Sorts semver versions of a package.
         * 
         * @param a   A semver version of a package.
         * @param b   A semver version of a package.
         * @returns Whether a is less than b.
         */
        private static versionSorter(a: number[], b: number[]): number {
            for (let i: number = 0; i < a.length; i += 1) {
                if (a[i] !== b[i]) {
                    return a[i] < b[i] ? -1 : 1;
                }
            }

            return -1;
        }
    }
}
