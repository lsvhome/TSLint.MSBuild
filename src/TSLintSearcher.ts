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
            this.packagesDirectory = this.resolvePackagesDirectory();
            console.log(`Resolved packages directory to '${this.packagesDirectory}'.`);

            this.tsLintPackage = this.resolveTSLintPackageDirectory();
            console.log(`Resolved TSLint package directory to '${this.tsLintPackage}'.`);
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
         * @returns The parent project's NuGet packages folder.
         */
        private resolvePackagesDirectory(): string {
            console.log("Resolving packages directory...");

            let originalPath: string = path.resolve(__dirname, "../.."),
                currentPath: string = originalPath;

            while (true) {
                if (currentPath.length < 3) {
                    throw new Error("Too far up to find packages directory.");
                }

                console.log(`\tChecking '${currentPath}'...`);

                let childNames: string[] = fs.readdirSync(currentPath);
                if (childNames.indexOf(packagesFolderName) !== -1) {
                    currentPath = path.resolve(currentPath, packagesFolderName);
                    break;
                }

                let nextPath = path.resolve(currentPath, "..");
                if (currentPath === nextPath) {
                    console.log("Could not find \"packages\" directory. Defaulting to current directory.");
                    return originalPath;
                }

                currentPath = nextPath;
            }

            return currentPath;
        }

        /**
         * @returns The highest version of the TSLint NuGet package.
         */
        private resolveTSLintPackageDirectory(): string {
            console.log("Resolving TSLint package directory...");

            let lintVersions: number[][] = fs.readdirSync(this.packagesDirectory)
                .filter(folderName => /tslint.\b\d+.\d+.\d+\b/.test(folderName))
                .map(folderName => this.parseTSLintPackageVersionFromName(folderName));

            if (lintVersions.length === 0) {
                throw new Error("Couldn't find a TSLint package.");
            }

            lintVersions.sort(TSLintSearcher.versionSorter);
            console.log(`\tFound TSLint versions [${this.joinLintVersions(lintVersions)}].`);

            return `tslint.${lintVersions[0].join(".")}`;
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
