/**
 * (c) Microsoft
 */
/// <reference path="../typings/main/ambient/node/node.d.ts" />
/// <reference path="Folder.ts" />
/// <reference path="FolderCollection.ts" />
/// <reference path="LintRunner.ts" />

"use strict";

namespace LinterTest {
    let fs = require("fs"),
        path = require("path"),
        yargs = require("yargs");

    /**
     * Retrieves the list of input .ts files from a text file. 
     * 
     * @param filePath   A file path to a text file.
     * @returns A list of input .ts files.
     */
    function getInputFilesList(filePath): string[] {
        return fs.readFileSync(filePath)
            .toString()
            .replace(/\r/g, "")
            .split("\n")
            .filter(file => file);
    }

    /**
     * @returns Command-line arguments, mainly the files text file path.
     */
    function readCommandLineArgs() {
        return yargs
            .usage("usage: $0")
            .demand(["files"])
            .options({
                "files": {
                    describe: "path to a text file containing a list of .ts files to be linted, one file per line"
                }
            })
            .argv;
    }

    /**
     * Formats a TSLint error for display in Visual Studio.
     * 
     * @param lintError   Either a TSLint violation POJO or an error String.
     * @todo Use tslint.d.ts for a type definition.
     */
    function formatOutput(lintError: string | any): string {
        if (typeof lintError === "string") {
            return lintError;
        }

        return lintError.name
            + `(${(lintError.startPosition.line + 1)},${(lintError.startPosition.character + 1)})`
            + `: error tslint-${lintError.ruleName}`
            + `: TSLint failure: ${lintError.failure}.`;
    }

    (() => {
        "use strict";

        let args = readCommandLineArgs(),
            filePaths = getInputFilesList(args.files),
            runner = new LinterTest.LintRunner();

        runner
            .addFilePaths(filePaths)
            .then(() => runner.runTSLint())
            .then(lintErrors => {
                if (lintErrors.length === 0) {
                    return;
                }

                let lintErrorsFormatted = lintErrors
                    .map(lintError => formatOutput(lintError))
                    .join("\n");

                console.error(lintErrorsFormatted);
            });
    })();
}
